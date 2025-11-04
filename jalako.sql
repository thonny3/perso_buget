-- phpMyAdmin SQL Dump
-- version 5.0.2
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : mar. 04 nov. 2025 à 13:00
-- Version du serveur :  5.7.31
-- Version de PHP : 7.3.21

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `jalako`
--

-- --------------------------------------------------------

--
-- Structure de la table `abonnements`
--

DROP TABLE IF EXISTS `abonnements`;
CREATE TABLE IF NOT EXISTS `abonnements` (
  `id_abonnement` int(11) NOT NULL AUTO_INCREMENT,
  `id_user` int(11) DEFAULT NULL,
  `nom` varchar(100) DEFAULT NULL,
  `montant` decimal(10,2) DEFAULT NULL,
  `fréquence` varchar(20) DEFAULT NULL,
  `prochaine_echeance` date DEFAULT NULL,
  `rappel` tinyint(1) DEFAULT NULL,
  `icon` varchar(100) DEFAULT NULL,
  `couleur` varchar(20) DEFAULT NULL,
  `actif` tinyint(1) NOT NULL DEFAULT '1',
  `id_compte` int(11) DEFAULT NULL,
  `auto_renouvellement` tinyint(1) DEFAULT '0',
  `date_dernier_renouvellement` date DEFAULT NULL,
  PRIMARY KEY (`id_abonnement`),
  KEY `id_user` (`id_user`),
  KEY `idx_abonnements_user` (`id_user`),
  KEY `idx_abonnements_actif` (`actif`)
) ENGINE=MyISAM AUTO_INCREMENT=9 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `abonnements`
--

INSERT INTO `abonnements` (`id_abonnement`, `id_user`, `nom`, `montant`, `fréquence`, `prochaine_echeance`, `rappel`, `icon`, `couleur`, `actif`, `id_compte`, `auto_renouvellement`, `date_dernier_renouvellement`) VALUES
(1, 10, 'Netflix', '500.00', 'Mensuel', '2026-02-15', 1, 'Tv', '#3B82F6', 1, 11, 1, '2035-12-15'),
(2, 10, 'dqfds', '500.00', 'Mensuel', '2025-12-15', 1, 'Tv', '#3B82F6', 0, 11, 1, '2025-11-16'),
(6, 12, 'Netflix', '5000.00', 'Mensuel', '2026-01-15', 1, 'Tv', '#8B5CF6', 1, 12, 1, '2035-12-15'),
(3, 10, 'fdgf', '2200.00', 'Mensuel', '2025-11-16', 1, 'Tv', '#14B8A6', 1, 11, 0, NULL),
(4, 10, 'dfds', '2000.00', 'Mensuel', '2025-11-16', 1, 'Music', '#3B82F6', 1, 11, 0, NULL),
(5, 10, 'Spotify', '100.00', 'Mensuel', '2026-01-15', 1, 'Music', '#8B5CF6', 1, 11, 1, '2035-12-15'),
(7, 12, 'Soptify', '5000.00', 'Mensuel', '2026-01-15', 1, 'Tv', '#6B7280', 1, 12, 1, '2035-12-15'),
(8, 12, 'StarLink', '13000.00', 'Mensuel', '2026-12-15', 1, 'Heart', '#EC4899', 1, 12, 0, '2025-10-17');

-- --------------------------------------------------------

--
-- Structure de la table `alertes`
--

DROP TABLE IF EXISTS `alertes`;
CREATE TABLE IF NOT EXISTS `alertes` (
  `id_alerte` int(11) NOT NULL AUTO_INCREMENT,
  `id_user` int(11) NOT NULL,
  `type_alerte` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_declenchement` datetime DEFAULT NULL,
  `date_creation` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `lue` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id_alerte`),
  KEY `idx_alertes_user` (`id_user`),
  KEY `idx_alertes_unread` (`id_user`,`lue`),
  KEY `idx_alertes_type_date` (`id_user`,`type_alerte`),
  KEY `idx_alertes_declenchement` (`date_declenchement`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `alertes`
--

INSERT INTO `alertes` (`id_alerte`, `id_user`, `type_alerte`, `message`, `date_declenchement`, `date_creation`, `lue`) VALUES
(12, 12, 'Alerte seuil dépenses', 'Dépenses du jour (6500) supérieures ou égales au seuil (5000).', '2025-11-03 16:47:02', '2025-11-03 11:47:02', 1),
(13, 12, 'Alerte seuil dépenses', 'Dépenses du jour (7000) supérieures ou égales au seuil (5000).', '2025-11-03 16:47:57', '2025-11-03 11:47:56', 1);

-- --------------------------------------------------------

--
-- Structure de la table `alertthresholds`
--

DROP TABLE IF EXISTS `alertthresholds`;
CREATE TABLE IF NOT EXISTS `alertthresholds` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_user` int(11) NOT NULL,
  `domain` enum('solde','comptes','depenses','budget','objectifs') NOT NULL,
  `value` decimal(12,2) NOT NULL,
  `info` text,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_user_domain` (`id_user`,`domain`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `alertthresholds`
--

INSERT INTO `alertthresholds` (`id`, `id_user`, `domain`, `value`, `info`, `updated_at`) VALUES
(1, 12, 'depenses', '5000.00', 'ezrer', '2025-10-17 17:15:19'),
(3, 12, 'budget', '5222.00', NULL, '2025-10-17 16:12:57'),
(5, 12, 'comptes', '450.00', 'ezezezeze', '2025-10-17 17:15:46');

-- --------------------------------------------------------

--
-- Structure de la table `budgets`
--

DROP TABLE IF EXISTS `budgets`;
CREATE TABLE IF NOT EXISTS `budgets` (
  `id_budget` int(11) NOT NULL AUTO_INCREMENT,
  `id_user` int(11) DEFAULT NULL,
  `id_categorie_depense` int(11) DEFAULT NULL,
  `mois` varchar(20) DEFAULT NULL,
  `montant_max` decimal(10,2) DEFAULT NULL,
  `montant_restant` decimal(10,2) DEFAULT NULL,
  `pourcentage_utilise` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id_budget`),
  KEY `id_user` (`id_user`),
  KEY `id_categorie_depense` (`id_categorie_depense`)
) ENGINE=MyISAM AUTO_INCREMENT=13 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `budgets`
--

INSERT INTO `budgets` (`id_budget`, `id_user`, `id_categorie_depense`, `mois`, `montant_max`, `montant_restant`, `pourcentage_utilise`) VALUES
(4, 4, 2, '2025-11', '0.00', '0.00', 0),
(2, 4, 2, '2025-10', '450000.00', NULL, 0),
(3, 4, 1, '2025-10', '45000.00', '45000.00', 0),
(5, 4, 1, '2025-11', '0.00', '0.00', 0),
(6, 10, 2, '2025-10', '50000.00', '50000.00', 0),
(7, 11, 3, '2025-10', '500000.00', '499800.00', 0),
(8, 12, 3, '2025-12', '5000.00', '5000.00', 0),
(9, 12, 3, '2025-11', '4500.00', '43500.00', 0),
(10, 12, 2, '2025-11', '65000.00', '65000.00', 0),
(12, 12, 4, '2025-11', '45000.00', '45000.00', 0);

-- --------------------------------------------------------

--
-- Structure de la table `categories_depenses`
--

DROP TABLE IF EXISTS `categories_depenses`;
CREATE TABLE IF NOT EXISTS `categories_depenses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=9 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `categories_depenses`
--

INSERT INTO `categories_depenses` (`id`, `nom`) VALUES
(1, 'Logement 1'),
(2, 'Transport'),
(3, 'Alimentation'),
(4, 'Santé'),
(5, 'Éducation'),
(6, 'Divertissement'),
(7, 'Voyages'),
(8, 'Autres');

-- --------------------------------------------------------

--
-- Structure de la table `categories_revenus`
--

DROP TABLE IF EXISTS `categories_revenus`;
CREATE TABLE IF NOT EXISTS `categories_revenus` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=9 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `categories_revenus`
--

INSERT INTO `categories_revenus` (`id`, `nom`) VALUES
(1, 'Salaire'),
(2, 'Prime'),
(3, 'Freelance / Mission'),
(4, 'Investissements'),
(5, 'Dividendes'),
(6, 'Ventes / Revente'),
(7, 'Cadeaux / Héritage'),
(8, 'Autres revenus');

-- --------------------------------------------------------

--
-- Structure de la table `comptes`
--

DROP TABLE IF EXISTS `comptes`;
CREATE TABLE IF NOT EXISTS `comptes` (
  `id_compte` int(11) NOT NULL AUTO_INCREMENT,
  `id_user` int(11) DEFAULT NULL,
  `nom` varchar(100) DEFAULT NULL,
  `solde` decimal(10,2) DEFAULT '0.00',
  `type` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_compte`),
  KEY `id_user` (`id_user`)
) ENGINE=MyISAM AUTO_INCREMENT=22 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `comptes`
--

INSERT INTO `comptes` (`id_compte`, `id_user`, `nom`, `solde`, `type`) VALUES
(1, 1, 'Compte principal', '0.00', 'courant'),
(2, 1, 'Orange Money', '85000.00', 'Mobile money'),
(3, 2, 'Compte mobile ', '420275.00', 'trading'),
(4, 2, 'Agent de poche', '-45000.00', 'courant'),
(6, 4, 'Mobile money ', '0.00', 'trading'),
(7, 8, 'Banque BNI', '500000.00', 'courant'),
(8, 4, 'Compte Famille', '3102100.00', 'epargne'),
(9, 4, 'zazaz', '5000.00', 'trading'),
(10, 9, 'BNI', '982800.00', 'courant'),
(11, 10, 'compte perso', '278600.00', 'courant'),
(12, 12, 'Comppte epargne', '4820720.00', 'epargne'),
(13, 12, 'Zaza', '-1000.00', 'courant'),
(21, 12, 'Tejs', '493270.00', 'epargne');

-- --------------------------------------------------------

--
-- Structure de la table `comptes_partages`
--

DROP TABLE IF EXISTS `comptes_partages`;
CREATE TABLE IF NOT EXISTS `comptes_partages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_compte` int(11) DEFAULT NULL,
  `id_user` int(11) DEFAULT NULL,
  `role` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_compte` (`id_compte`),
  KEY `id_user` (`id_user`)
) ENGINE=MyISAM AUTO_INCREMENT=26 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `comptes_partages`
--

INSERT INTO `comptes_partages` (`id`, `id_compte`, `id_user`, `role`) VALUES
(1, 1, 1, 'owner'),
(2, 2, 1, 'proprietaire'),
(3, 3, 2, 'proprietaire'),
(4, 4, 2, 'proprietaire'),
(5, 5, 4, 'proprietaire'),
(6, 6, 4, 'proprietaire'),
(7, 7, 8, 'proprietaire'),
(8, 7, 4, 'contributeur'),
(9, 8, 4, 'proprietaire'),
(10, 9, 4, 'proprietaire'),
(11, 10, 9, 'proprietaire'),
(12, 8, 10, 'contributeur'),
(13, 11, 10, 'proprietaire'),
(14, 11, 11, 'contributeur'),
(15, 12, 12, 'proprietaire'),
(16, 13, 12, 'proprietaire'),
(17, 14, 12, 'proprietaire'),
(18, 15, 12, 'proprietaire'),
(19, 16, 12, 'proprietaire'),
(20, 17, 12, 'proprietaire'),
(21, 18, 12, 'proprietaire'),
(22, 19, 12, 'proprietaire'),
(23, 20, 12, 'proprietaire'),
(24, 21, 12, 'proprietaire'),
(25, 21, 4, 'lecture');

-- --------------------------------------------------------

--
-- Structure de la table `contributions`
--

DROP TABLE IF EXISTS `contributions`;
CREATE TABLE IF NOT EXISTS `contributions` (
  `id_contribution` int(11) NOT NULL AUTO_INCREMENT,
  `id_objectif` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `montant` decimal(10,2) NOT NULL,
  `date_contribution` date NOT NULL,
  `id_compte` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_contribution`),
  KEY `id_objectif` (`id_objectif`),
  KEY `id_user` (`id_user`),
  KEY `id_compte` (`id_compte`)
) ENGINE=MyISAM AUTO_INCREMENT=29 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `contributions`
--

INSERT INTO `contributions` (`id_contribution`, `id_objectif`, `id_user`, `montant`, `date_contribution`, `id_compte`) VALUES
(1, 1, 4, '100.00', '2025-10-08', 6),
(2, 1, 4, '5000.00', '2025-10-08', 6),
(3, 1, 4, '900.00', '2025-10-08', 6),
(4, 1, 4, '200.00', '2025-10-08', 6),
(5, 1, 4, '500000.00', '2025-10-08', 6),
(6, 2, 4, '100.00', '2025-10-08', 6),
(7, 2, 4, '200.00', '2025-10-08', 6),
(8, 2, 4, '1000.00', '2025-10-08', 6),
(9, 2, 4, '1000.00', '2025-10-08', 6),
(10, 2, 4, '1000.00', '2025-10-08', 6),
(11, 2, 4, '1000.00', '2025-10-08', 6),
(12, 3, 4, '200.00', '2025-10-08', 6),
(13, 3, 4, '100.00', '2025-10-08', 6),
(14, 3, 4, '200.00', '2025-10-08', 6),
(15, 4, 4, '100.00', '2025-10-08', 6),
(16, 4, 4, '100.00', '2025-10-08', 6),
(17, 4, 4, '1200.00', '2025-10-08', 6),
(18, 4, 4, '1200.00', '2025-10-08', 6),
(19, 4, 4, '1200.00', '2025-10-08', 6),
(20, 6, 4, '2000.00', '2025-10-08', 8),
(21, 8, 10, '200.00', '2025-10-15', 8),
(22, 8, 10, '4500.00', '2025-10-15', 8),
(23, 8, 10, '45300.00', '2025-10-15', 8),
(24, 9, 10, '100000.00', '2025-10-15', 8),
(25, 10, 12, '5000.00', '2025-11-03', 12),
(26, 11, 12, '5000.00', '2025-11-03', 12),
(27, 12, 12, '5110.00', '2025-11-04', 12),
(28, 13, 12, '5000.00', '2025-11-04', 12);

-- --------------------------------------------------------

--
-- Structure de la table `depenses`
--

DROP TABLE IF EXISTS `depenses`;
CREATE TABLE IF NOT EXISTS `depenses` (
  `id_depense` int(11) NOT NULL AUTO_INCREMENT,
  `id_user` int(11) DEFAULT NULL,
  `montant` decimal(10,2) DEFAULT NULL,
  `date_depense` date DEFAULT NULL,
  `description` text,
  `id_categorie_depense` int(11) DEFAULT NULL,
  `id_compte` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_depense`),
  KEY `id_user` (`id_user`),
  KEY `id_categorie_depense` (`id_categorie_depense`),
  KEY `id_compte` (`id_compte`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `depenses`
--

INSERT INTO `depenses` (`id_depense`, `id_user`, `montant`, `date_depense`, `description`, `id_categorie_depense`, `id_compte`) VALUES
(1, 12, '5000.00', '2025-10-27', 'Courses carrefour', 3, 12),
(2, 12, '5680.00', '2025-10-25', 'Kestajfjs', 2, 21),
(3, 12, '6500.00', '2025-11-03', 'Nanao bazar', 3, 12),
(4, 12, '500.00', '2025-11-03', 'Tevs', 1, 12),
(5, 4, '478220.00', '2025-11-03', 'fgdsgvbd', 3, 6);

-- --------------------------------------------------------

--
-- Structure de la table `dettes`
--

DROP TABLE IF EXISTS `dettes`;
CREATE TABLE IF NOT EXISTS `dettes` (
  `id_dette` int(11) NOT NULL AUTO_INCREMENT,
  `id_user` int(11) NOT NULL,
  `nom` varchar(150) DEFAULT NULL,
  `montant_initial` decimal(10,2) NOT NULL,
  `montant_restant` decimal(10,2) NOT NULL DEFAULT '0.00',
  `taux_interet` decimal(5,2) NOT NULL DEFAULT '0.00',
  `date_debut` date DEFAULT NULL,
  `date_fin_prevue` date DEFAULT NULL,
  `paiement_mensuel` decimal(10,2) NOT NULL DEFAULT '0.00',
  `creancier` varchar(150) DEFAULT NULL,
  `sens` varchar(10) DEFAULT 'autre',
  `statut` varchar(50) NOT NULL DEFAULT 'en cours',
  `type` varchar(50) NOT NULL DEFAULT 'personne',
  PRIMARY KEY (`id_dette`),
  KEY `id_user` (`id_user`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `dettes`
--

INSERT INTO `dettes` (`id_dette`, `id_user`, `nom`, `montant_initial`, `montant_restant`, `taux_interet`, `date_debut`, `date_fin_prevue`, `paiement_mensuel`, `creancier`, `sens`, `statut`, `type`) VALUES
(1, 12, 'composé', '500.00', '500.00', '0.00', '2025-11-04', '2025-11-21', '0.00', 'Mpamarotsy composé', 'moi', 'terminé', 'personne'),
(2, 12, 'test', '5000.00', '0.00', '0.00', '2025-11-01', '2025-11-04', '0.00', 'azazaz', 'autre', 'terminé', 'personne'),
(3, 12, 'fffr', '2000.00', '0.00', '0.00', '2025-11-04', '2025-11-14', '0.00', 'fvv', 'moi', 'terminé', 'personne');

-- --------------------------------------------------------

--
-- Structure de la table `investissements`
--

DROP TABLE IF EXISTS `investissements`;
CREATE TABLE IF NOT EXISTS `investissements` (
  `id_investissement` int(11) NOT NULL AUTO_INCREMENT,
  `id_user` int(11) NOT NULL,
  `nom` varchar(200) NOT NULL,
  `type` varchar(50) DEFAULT 'immobilier',
  `projet` varchar(255) DEFAULT NULL,
  `date_achat` date NOT NULL,
  `montant_investi` decimal(12,2) NOT NULL,
  `valeur_actuelle` decimal(12,2) DEFAULT NULL,
  `duree_mois` int(11) DEFAULT NULL,
  `taux_prevu` decimal(6,2) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_investissement`),
  KEY `id_user` (`id_user`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `investissements`
--

INSERT INTO `investissements` (`id_investissement`, `id_user`, `nom`, `type`, `projet`, `date_achat`, `montant_investi`, `valeur_actuelle`, `duree_mois`, `taux_prevu`, `created_at`) VALUES
(1, 12, 'Assumenda voluptates teka', 'autre', 'Et rerum natus dolor', '2001-05-14', '96.83', '66.52', 62, '57.62', '2025-10-20 16:29:35'),
(2, 12, 'Hdj', 'actions', 'Gdjsjdvksjs', '2025-10-27', '50000.00', '0.00', 5, '5.00', '2025-10-27 20:49:12');

-- --------------------------------------------------------

--
-- Structure de la table `investissements_depenses`
--

DROP TABLE IF EXISTS `investissements_depenses`;
CREATE TABLE IF NOT EXISTS `investissements_depenses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_investissement` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `montant` decimal(12,2) NOT NULL,
  `date_depense` date NOT NULL,
  `type` varchar(50) DEFAULT NULL,
  `note` text,
  `id_compte` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `id_investissement` (`id_investissement`),
  KEY `id_user` (`id_user`),
  KEY `id_compte` (`id_compte`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `investissements_depenses`
--

INSERT INTO `investissements_depenses` (`id`, `id_investissement`, `id_user`, `montant`, `date_depense`, `type`, `note`, `id_compte`, `created_at`) VALUES
(1, 1, 12, '450.00', '2025-10-20', 'impot', '2000', 12, '2025-10-20 16:35:55'),
(2, 2, 12, '5000.00', '2025-10-28', 'Ghjjj', 'Ghjj', 21, '2025-10-28 14:54:26');

-- --------------------------------------------------------

--
-- Structure de la table `investissements_revenus`
--

DROP TABLE IF EXISTS `investissements_revenus`;
CREATE TABLE IF NOT EXISTS `investissements_revenus` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_investissement` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `montant` decimal(12,2) NOT NULL,
  `date_revenu` date NOT NULL,
  `type` varchar(50) DEFAULT NULL,
  `note` text,
  `id_compte` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `id_investissement` (`id_investissement`),
  KEY `id_user` (`id_user`),
  KEY `id_compte` (`id_compte`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `investissements_revenus`
--

INSERT INTO `investissements_revenus` (`id`, `id_investissement`, `id_user`, `montant`, `date_revenu`, `type`, `note`, `id_compte`, `created_at`) VALUES
(1, 1, 12, '2000.00', '2025-10-20', 'revente', 'zazaza', 13, '2025-10-20 16:31:20'),
(2, 2, 12, '500.00', '2025-10-28', 'Te st', 'Egsjd', 12, '2025-10-28 14:53:57');

-- --------------------------------------------------------

--
-- Structure de la table `objectifs`
--

DROP TABLE IF EXISTS `objectifs`;
CREATE TABLE IF NOT EXISTS `objectifs` (
  `id_objectif` int(11) NOT NULL AUTO_INCREMENT,
  `id_user` int(11) DEFAULT NULL,
  `nom` varchar(100) DEFAULT NULL,
  `montant_objectif` decimal(10,2) DEFAULT NULL,
  `date_limite` date DEFAULT NULL,
  `montant_actuel` decimal(10,2) DEFAULT NULL,
  `pourcentage` int(11) NOT NULL DEFAULT '0',
  `icone` varchar(50) DEFAULT NULL,
  `couleur` varchar(7) DEFAULT NULL,
  `statut` varchar(50) NOT NULL DEFAULT 'En cours',
  PRIMARY KEY (`id_objectif`),
  KEY `id_user` (`id_user`)
) ENGINE=MyISAM AUTO_INCREMENT=14 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `objectifs`
--

INSERT INTO `objectifs` (`id_objectif`, `id_user`, `nom`, `montant_objectif`, `date_limite`, `montant_actuel`, `pourcentage`, `icone`, `couleur`, `statut`) VALUES
(1, 4, 'Achat  voiture', '50000.00', '2025-10-30', '500200.00', 100, 'Car', '#EF4444', 'Atteint'),
(2, 4, 'Voyage', '5000.00', '2025-10-17', '4300.00', 100, 'Plane', '#8B5CF6', 'Atteint'),
(3, 4, 'Achat  une maison ', '500.00', '2025-10-10', '500.00', 100, 'Home', '#10B981', 'Atteint'),
(4, 4, 'Achat un moto', '5000.00', '2025-10-17', '23800.00', 100, 'Target', '#6B7280', 'Atteint'),
(5, 4, 'sdfd', '500000.00', '2025-10-31', '224000.00', 1, 'Car', '#6B7280', 'En cours'),
(6, 4, 'fdsfsdgfdfgdfgfd', '200000.00', '2025-10-25', '4000.00', 3, 'Heart', '#EC4899', 'En cours'),
(7, 9, 'zsdsqdsq', '2000.00', '2027-06-09', '0.00', 0, 'Home', '#14B8A6', 'En cours'),
(8, 10, 'Achat  une voiture 1', '50000.00', '2025-11-27', '50000.00', 100, 'Car', '#EF4444', 'Atteint'),
(9, 10, 'Création une maison ', '20000000.00', '2035-02-15', '100000.00', 1, 'Home', '#14B8A6', 'En cours'),
(11, 12, 'dsqds', '5000.00', '2025-10-29', '5000.00', 100, 'Smartphone', '#14B8A6', 'Atteint'),
(12, 12, 'vfcvcv', '5110.00', '2025-11-23', '5110.00', 100, 'Smartphone', '#6B7280', 'Atteint'),
(13, 12, 'Achat  une maison ', '5000.00', '2025-11-21', '5000.00', 100, 'Home', '#14B8A6', 'Atteint');

-- --------------------------------------------------------

--
-- Structure de la table `passwordresets`
--

DROP TABLE IF EXISTS `passwordresets`;
CREATE TABLE IF NOT EXISTS `passwordresets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_user` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `used` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_token` (`token`),
  KEY `id_user` (`id_user`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `passwordresets`
--

INSERT INTO `passwordresets` (`id`, `id_user`, `token`, `expires_at`, `used`, `created_at`) VALUES
(1, 12, '222089', '2025-10-20 15:28:40', 0, '2025-10-20 20:18:40'),
(2, 12, '919674', '2025-10-20 15:30:13', 0, '2025-10-20 20:20:13'),
(3, 12, '923993', '2025-10-20 15:32:33', 1, '2025-10-20 20:22:32'),
(4, 12, '473023', '2025-10-20 15:46:12', 1, '2025-10-20 20:36:11'),
(5, 12, '200560', '2025-10-21 17:17:14', 1, '2025-10-21 22:07:14');

-- --------------------------------------------------------

--
-- Structure de la table `remboursements`
--

DROP TABLE IF EXISTS `remboursements`;
CREATE TABLE IF NOT EXISTS `remboursements` (
  `id_remboursement` int(11) NOT NULL AUTO_INCREMENT,
  `id_dette` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `montant` decimal(10,2) NOT NULL,
  `date_paiement` date NOT NULL,
  `id_compte` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_remboursement`),
  KEY `id_dette` (`id_dette`),
  KEY `id_user` (`id_user`),
  KEY `id_compte` (`id_compte`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `remboursements`
--

INSERT INTO `remboursements` (`id_remboursement`, `id_dette`, `id_user`, `montant`, `date_paiement`, `id_compte`) VALUES
(1, 4, 12, '500.00', '2025-11-20', 12),
(2, 1, 12, '50.00', '2025-11-04', 12),
(3, 1, 12, '10.00', '2025-11-04', 21),
(4, 1, 12, '440.00', '2025-11-04', 12);

-- --------------------------------------------------------

--
-- Structure de la table `revenus`
--

DROP TABLE IF EXISTS `revenus`;
CREATE TABLE IF NOT EXISTS `revenus` (
  `id_revenu` int(11) NOT NULL AUTO_INCREMENT,
  `id_user` int(11) DEFAULT NULL,
  `montant` decimal(10,2) DEFAULT NULL,
  `date_revenu` date DEFAULT NULL,
  `source` text,
  `id_categorie_revenu` int(11) DEFAULT NULL,
  `id_compte` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_revenu`),
  KEY `id_user` (`id_user`),
  KEY `id_categorie_revenu` (`id_categorie_revenu`),
  KEY `id_compte` (`id_compte`)
) ENGINE=MyISAM AUTO_INCREMENT=16 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `revenus`
--

INSERT INTO `revenus` (`id_revenu`, `id_user`, `montant`, `date_revenu`, `source`, `id_categorie_revenu`, `id_compte`) VALUES
(1, 4, '2000.00', '2025-10-05', 'salaren 213', 1, 6),
(2, 4, '50000.00', '2025-05-08', 'Salaire ', 5, 6),
(3, 4, '15200.00', '2025-11-06', 'Test', 2, 6),
(7, 10, '100.00', '2025-10-14', 'salaire ', 1, 8),
(8, 10, '2200.00', '2025-11-15', 'saffff', 1, 11),
(15, 12, '5000.00', '2025-10-26', 'Test', 8, 21);

-- --------------------------------------------------------

--
-- Structure de la table `transfertshistorique`
--

DROP TABLE IF EXISTS `transfertshistorique`;
CREATE TABLE IF NOT EXISTS `transfertshistorique` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_user` int(10) UNSIGNED NOT NULL,
  `type` enum('compte_to_objectif','objectif_to_compte','compte_to_compte') NOT NULL,
  `id_compte_source` int(10) UNSIGNED DEFAULT NULL,
  `id_compte_cible` int(10) UNSIGNED DEFAULT NULL,
  `id_objectif_source` int(10) UNSIGNED DEFAULT NULL,
  `id_objectif_cible` int(10) UNSIGNED DEFAULT NULL,
  `montant` decimal(15,2) NOT NULL,
  `date_transfert` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_date` (`id_user`,`date_transfert`),
  KEY `idx_type` (`type`),
  KEY `idx_compte_source` (`id_compte_source`),
  KEY `idx_compte_cible` (`id_compte_cible`),
  KEY `idx_objectif_source` (`id_objectif_source`),
  KEY `idx_objectif_cible` (`id_objectif_cible`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `transfertshistorique`
--

INSERT INTO `transfertshistorique` (`id`, `id_user`, `type`, `id_compte_source`, `id_compte_cible`, `id_objectif_source`, `id_objectif_cible`, `montant`, `date_transfert`) VALUES
(1, 4, 'compte_to_objectif', 8, NULL, NULL, 5, '2000.00', '2025-10-08 15:35:27'),
(2, 4, 'compte_to_objectif', 8, NULL, NULL, 4, '20000.00', '2025-10-08 15:44:31'),
(3, 4, 'compte_to_objectif', 8, NULL, NULL, 5, '1000.00', '2025-10-08 15:45:36'),
(4, 4, 'compte_to_objectif', 8, NULL, NULL, 5, '2000.00', '2025-10-08 15:47:20'),
(5, 4, 'compte_to_objectif', 8, NULL, NULL, 5, '4000.00', '2025-10-08 15:49:57'),
(6, 4, 'compte_to_objectif', 8, NULL, NULL, 5, '15000.00', '2025-10-08 15:50:54'),
(7, 4, 'compte_to_objectif', 8, NULL, NULL, 5, '200000.00', '2025-10-08 15:51:44'),
(8, 4, 'compte_to_objectif', 8, NULL, NULL, 6, '2000.00', '2025-10-08 15:55:01'),
(9, 10, 'compte_to_compte', 11, 8, NULL, NULL, '2000.00', '2025-10-14 14:48:53');

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id_user` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) DEFAULT NULL,
  `prenom` varchar(100) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `mot_de_passe` text,
  `devise` varchar(10) DEFAULT 'MGA',
  `image` varchar(255) DEFAULT NULL,
  `role` enum('admin','user') DEFAULT 'user',
  `date_creation` datetime DEFAULT CURRENT_TIMESTAMP,
  `actif` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_user`),
  UNIQUE KEY `email` (`email`)
) ENGINE=MyISAM AUTO_INCREMENT=13 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id_user`, `nom`, `prenom`, `email`, `mot_de_passe`, `devise`, `image`, `role`, `date_creation`, `actif`) VALUES
(1, 'Admin', 'Admin', 'admin@jalako.com', '$2b$10$7.5SbExB0Vqo.aqKjP9dO.UGanqF.jW8ER.NTeHYI8xROvnYpVbEO', 'MGA', NULL, 'admin', '2025-08-25 10:04:39', 1),
(4, 'TAHINJANAHARY ', 'Marie Angela', 'angela@gmail.com', '$2b$10$YnFoGk2KRpa8vfz5Ia7dH.xAZIO.wzbrJqw46ExWYBK7c2ZNun6Ba', 'MGA', '1759934361054-WhatsApp Image 2025-10-03 at 20.42.33.jpeg', 'user', '2025-09-17 14:27:13', 1),
(7, 'sfdsfds', 'fdsfgd', 'fdsfdsfdsfds@gmail.com', '$2b$10$WRQS7AhaY/8vg0sjlqPYiOtsjqbiAdNoHRNDMHnmQY/hOe9KNvTRu', 'JPY', NULL, 'user', '2025-10-04 11:42:27', 1),
(8, 'Firiscoh', 'Elyah', 'elyah@gmail.com', '$2b$10$a5Ut8.pF7ryLQeua3eaPj.b6Mh3jh9Uthq9BDz4fpXDdyqA4vdaLG', 'MGA', NULL, 'user', '2025-10-06 12:44:03', 1),
(9, 'Nilsesn', 'Nilsesn', 'nilsen@example.com', '$2b$10$IXDHdJWSaLgBuNWxTAqPduWJ88KcQilWCH4BRzlADm4RXfMPuQgFS', 'EUR', NULL, 'user', '2025-10-10 10:56:25', 1),
(10, 'ANDRIATSIALO', 'Yael', 'yael@gmail.com', '$2b$10$ykWXb1x40sjLhNeJef593.NsJlRIgKms9eapsYUTstZrLXn/UtVu2', 'MGA', NULL, 'user', '2025-10-14 10:13:50', 1),
(11, 'Kim', 'Karim', 'karim@gmail.com', '$2b$10$SSNx9bLyXDJTTgSp9rdI.uESCigO6rjAFEb3bxwmx191ti17hhlDe', 'MGA', NULL, 'user', '2025-10-15 09:28:24', 1),
(12, 'RANDRIANASOLO', 'Jean Marc Thonny', 'randrianasolomarcthonny@gmail.com', '$2b$10$lKwc1ZNs54XOSTCmXA5NzexLuNrN3JBTPz9GQ1o9UfG7Ht4JMJqmC', 'MGA', '1760695521269-Capture.PNG', 'user', '2025-10-15 15:18:02', 1);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
