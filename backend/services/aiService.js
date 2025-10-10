const tf = require('@tensorflow/tfjs')
const db = require('../config/db')

// Helper to fetch all expenses for a user
function fetchExpensesByUser(userId) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT d.montant, d.date_depense, d.id_categorie_depense, c.nom AS categorie_nom
      FROM Depenses d
      LEFT JOIN categories_depenses c ON d.id_categorie_depense = c.id
      WHERE d.id_user = ?
      ORDER BY d.date_depense ASC
    `;
    db.query(sql, [userId], (err, rows) => {
      if (err) return reject(err)
      resolve(rows || [])
    })
  })
}

function groupByMonth(expenses) {
  const byMonth = new Map()
  for (const e of expenses) {
    const monthStr = new Date(e.date_depense).toISOString().slice(0, 7) // YYYY-MM
    const prev = byMonth.get(monthStr) || 0
    byMonth.set(monthStr, prev + Number(e.montant || 0))
  }
  const entries = Array.from(byMonth.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  return entries
}

function topCategories(expenses, topN = 5) {
  const byCat = new Map()
  for (const e of expenses) {
    const name = (e.categorie_nom && String(e.categorie_nom).trim()) || 'Autre'
    byCat.set(name, (byCat.get(name) || 0) + Number(e.montant || 0))
  }
  return Array.from(byCat.entries())
    .map(([categorie, total]) => ({ categorie, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, topN)
}

async function analyzeExpenses(userId) {
  const expenses = await fetchExpensesByUser(userId)
  const monthly = groupByMonth(expenses)
  const total = expenses.reduce((s, e) => s + Number(e.montant || 0), 0)
  const avgMonthly = monthly.length ? total / monthly.length : 0
  const topCats = topCategories(expenses)
  return { total, avgMonthly, monthly, topCategories: topCats }
}

function buildSeries(monthly) {
  // monthly is array of ["YYYY-MM", total]
  const y = monthly.map(([, total]) => total)
  const x = y.map((_, i) => i + 1)
  return { x, y }
}

async function predictNextMonth(userId) {
  const expenses = await fetchExpensesByUser(userId)
  const monthly = groupByMonth(expenses)
  if (monthly.length < 2) {
    const last = monthly[monthly.length - 1]?.[1] || 0
    return { prediction: last, confidence: 0.2, monthly }
  }

  const { x, y } = buildSeries(monthly)
  const xs = tf.tensor1d(x)
  const ys = tf.tensor1d(y)

  const model = tf.sequential()
  model.add(tf.layers.dense({ units: 1, inputShape: [1] }))
  model.compile({ optimizer: tf.train.adam(0.1), loss: 'meanSquaredError' })

  // train briefly
  await model.fit(xs, ys, { epochs: 200, verbose: 0 })

  const nextX = tf.tensor2d([[x.length + 1]])
  const predTensor = model.predict(nextX)
  const prediction = Array.isArray(predTensor) ? predTensor[0].dataSync()[0] : predTensor.dataSync()[0]

  xs.dispose(); ys.dispose(); nextX.dispose(); tf.dispose(predTensor)

  const last = y[y.length - 1] || 0
  const delta = Math.abs(prediction - last)
  const confidence = Math.max(0.1, Math.min(0.95, 1 / (1 + delta / (last || 1))))

  return { prediction, confidence, monthly }
}

async function recommend(userId) {
  const analysis = await analyzeExpenses(userId)
  const recs = []

  if (analysis.topCategories.length) {
    const top = analysis.topCategories[0]
    recs.push({
      type: 'category_limit',
      message: `Fixer une limite sur la catégorie ${top.categorie} (total: ${top.total.toFixed(2)}).`,
      data: top
    })
  }

  if (analysis.avgMonthly > 0) {
    const target = analysis.avgMonthly * 0.9
    recs.push({
      type: 'monthly_target',
      message: `Objectif: réduire les dépenses mensuelles à ~${target.toFixed(2)} (−10%).`,
      data: { target }
    })
  }

  if (analysis.monthly.length >= 2) {
    const last = analysis.monthly[analysis.monthly.length - 1][1]
    const prev = analysis.monthly[analysis.monthly.length - 2][1]
    if (last > prev * 1.2) {
      recs.push({
        type: 'spike_alert',
        message: "Hausse récente détectée: analysez les transactions du dernier mois.",
        data: { last, prev }
      })
    }
  }

  return { recommendations: recs, analysis }
}

module.exports = { analyzeExpenses, predictNextMonth, recommend }


