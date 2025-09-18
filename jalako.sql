-- phpMyAdmin SQL Dump
-- version 4.9.2
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le :  jeu. 18 sep. 2025 à 15:05
-- Version du serveur :  10.4.10-MariaDB
-- Version de PHP :  7.3.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données :  `jalako`
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
  PRIMARY KEY (`id_abonnement`),
  KEY `id_user` (`id_user`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

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
  `pourcentage_utilise` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id_budget`),
  KEY `id_user` (`id_user`),
  KEY `id_categorie_depense` (`id_categorie_depense`)
) ENGINE=MyISAM AUTO_INCREMENT=16 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `budgets`
--

INSERT INTO `budgets` (`id_budget`, `id_user`, `id_categorie_depense`, `mois`, `montant_max`, `montant_restant`, `pourcentage_utilise`) VALUES
(4, 2, 2, '2025-09', '100.00', '0.00', 0),
(3, 2, 2, '2025-08', '200.00', '-7800.00', 0),
(5, 2, 2, '2025-07', '50000.00', '9000.00', 0),
(6, 2, 2, '2025-01', '200.00', '200.00', 0),
(7, 2, 1, '2025-08', '5000.00', '4800.00', 0),
(8, 2, 7, '2025-08', '4500000.00', '4500000.00', 0),
(9, 2, 4, '2025-03', '45000000.00', '45000000.00', 0),
(10, 2, 4, '2025-08', '78000.00', '78000.00', 0),
(11, 2, 3, '2025-09', '10000000.00', '9950000.00', 0),
(12, 4, 1, '2025-10', '50000.00', '50000.00', 0),
(13, 4, 1, '2025-09', '450000.00', '385000.00', 0),
(14, 4, 2, '2025-09', '78000.00', '78000.00', 0),
(15, 4, 3, '2025-09', '5000000.00', '4945000.00', 0);

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
(1, 'Logement'),
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
  `solde` decimal(10,2) DEFAULT 0.00,
  `type` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_compte`),
  KEY `id_user` (`id_user`)
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `comptes`
--

INSERT INTO `comptes` (`id_compte`, `id_user`, `nom`, `solde`, `type`) VALUES
(1, 1, 'Compte principal', '0.00', 'courant'),
(2, 1, 'Orange Money', '90000.00', 'Mobile money'),
(3, 2, 'Compte mobile ', '420275.00', 'trading'),
(4, 2, 'Agent de poche', '-45000.00', 'courant'),
(6, 4, 'Mobile money ', '376000.00', 'trading');

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
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `comptes_partages`
--

INSERT INTO `comptes_partages` (`id`, `id_compte`, `id_user`, `role`) VALUES
(1, 1, 1, 'owner'),
(2, 2, 1, 'proprietaire'),
(3, 3, 2, 'proprietaire'),
(4, 4, 2, 'proprietaire'),
(5, 5, 4, 'proprietaire'),
(6, 6, 4, 'proprietaire');

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
) ENGINE=MyISAM AUTO_INCREMENT=9 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `contributions`
--

INSERT INTO `contributions` (`id_contribution`, `id_objectif`, `id_user`, `montant`, `date_contribution`, `id_compte`) VALUES
(1, 5, 4, '2000.00', '2025-09-17', 5),
(2, 5, 4, '30.00', '2025-09-17', 5),
(3, 5, 4, '800000.00', '2025-09-17', 5),
(4, 6, 4, '20000.00', '2025-09-17', 5),
(5, 6, 4, '2000.00', '2025-09-17', 5),
(6, 6, 4, '5000.00', '2025-09-17', 6),
(7, 7, 4, '2000.00', '2025-09-17', 6),
(8, 6, 4, '200.00', '2025-09-17', 5);

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
  `description` text DEFAULT NULL,
  `id_categorie_depense` int(11) DEFAULT NULL,
  `id_compte` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_depense`),
  KEY `id_user` (`id_user`),
  KEY `id_categorie_depense` (`id_categorie_depense`),
  KEY `id_compte` (`id_compte`)
) ENGINE=MyISAM AUTO_INCREMENT=31 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `depenses`
--

INSERT INTO `depenses` (`id_depense`, `id_user`, `montant`, `date_depense`, `description`, `id_categorie_depense`, `id_compte`) VALUES
(1, 2, '1000.00', '2025-08-26', 'Achat de légumes au marché', 2, 3),
(2, 2, '1000.00', '2025-08-26', 'Achat de légumes au marché', 2, 3),
(3, 2, '1000.00', '2025-08-26', 'Achat de légumes au marché', 2, 3),
(4, 2, '1000.00', '2025-08-26', 'Achat de légumes au marché', 2, 3),
(5, 2, '1000.00', '2025-08-26', 'Achat de légumes au marché', 2, 3),
(6, 2, '1000.00', '2025-08-26', 'Achat de légumes au marché', 2, 3),
(7, 2, '1000.00', '2025-08-26', 'Achat de légumes au marché', 2, 3),
(8, 2, '1000.00', '2025-08-26', 'Achat de légumes au marché', 2, 3),
(9, 2, '1000.00', '2025-08-26', 'Achat de légumes au marché', 2, 3),
(10, 2, '1000.00', '2025-08-26', 'Achat de légumes au marché', 2, 3),
(11, 2, '1000.00', '2025-08-26', 'Achat de légumes au marché', 2, 3),
(12, 2, '1000.00', '2025-08-26', 'Achat de légumes au marché', 2, 3),
(13, 2, '1000.00', '2025-08-26', 'Achat de légumes au marché', 2, 3),
(14, 2, '100.00', '2025-09-26', 'Achat de légumes au marché', 2, 3),
(15, 2, '1000.00', '2025-07-26', 'Achat de légumes au marché', 2, 3),
(16, 2, '10000.00', '2025-07-26', 'Achat de légumes au marché', 2, 3),
(17, 2, '20000.00', '2025-07-26', 'Achat de légumes au marché', 2, 3),
(18, 2, '10000.00', '2025-07-26', 'Achat de légumes au marché', 2, 3),
(19, 2, '5000.00', '2025-08-26', 'test', 3, 3),
(20, 2, '5000.00', '2025-08-28', 'Courses la roues', 6, 3),
(21, 2, '200.00', '2025-08-27', 'hofa trano', 1, 3),
(22, 2, '2000.00', '2025-08-27', 'test', 3, 3),
(23, 2, '5000.00', '2025-08-31', 'ezezez', 4, 3),
(24, 2, '2000.00', '2025-08-27', 'retef', 4, 3),
(25, 2, '50000.00', '2025-09-05', 'Alimentation laoky ', 3, 4),
(26, 4, '5000.00', '2025-09-18', 'Course alimentaire', 3, 5),
(27, 4, '50000.00', '2025-09-17', 'Course alimentaire', 3, 5),
(28, 4, '2000.00', '2025-09-17', 'frfdf', 1, 6),
(29, 4, '20000.00', '2025-09-18', 'tretrt', 1, 6),
(30, 4, '45000.00', '2025-09-18', 'test', 1, 6);

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
  `pourcentage` int(11) NOT NULL DEFAULT 0,
  `statut` varchar(50) NOT NULL DEFAULT 'En cours',
  PRIMARY KEY (`id_objectif`),
  KEY `id_user` (`id_user`)
) ENGINE=MyISAM AUTO_INCREMENT=8 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `objectifs`
--

INSERT INTO `objectifs` (`id_objectif`, `id_user`, `nom`, `montant_objectif`, `date_limite`, `montant_actuel`, `pourcentage`, `statut`) VALUES
(1, 1, 'Acheter une voiture', '5000000.00', '2025-12-31', '0.00', 0, 'En cours'),
(2, 2, 'Et error ut incididu', '2.78', '1993-06-04', '0.00', 0, 'En cours'),
(3, 2, 'Achazt  voiture', '4500.00', '2028-06-29', '0.00', 0, 'En cours'),
(4, 4, 'test', '2000.00', '2025-09-17', '0.00', 0, 'En cours'),
(5, 4, 'Achat  une voiture', '5000.00', '2025-09-25', '802030.00', 0, 'En cours'),
(6, 4, 'Voyage ', '480000.00', '2025-10-17', '27200.00', 0, 'En cours'),
(7, 4, 'ggre', '2000.00', '2028-06-17', '2000.00', 0, 'En cours');

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
  `source` text DEFAULT NULL,
  `id_categorie_revenu` int(11) DEFAULT NULL,
  `id_compte` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_revenu`),
  KEY `id_user` (`id_user`),
  KEY `id_categorie_revenu` (`id_categorie_revenu`),
  KEY `id_compte` (`id_compte`)
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `revenus`
--

INSERT INTO `revenus` (`id_revenu`, `id_user`, `montant`, `date_revenu`, `source`, `id_categorie_revenu`, `id_compte`) VALUES
(2, 1, '20000.00', '2025-08-25', 'Salaire mois d\'aôut', 1, 2),
(3, 1, '30000.00', '2025-08-25', 'Frellance', 3, 2),
(4, 2, '5.00', '2025-08-26', 'SALAIRE JANVIER', 1, 3),
(5, 2, '5000.00', '2025-08-27', 'saliredfdfdf', 2, 3),
(6, 4, '2000.00', '2025-09-18', 'salaire mois de novemebre', 1, 5);

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
  `mot_de_passe` text DEFAULT NULL,
  `devise` varchar(10) DEFAULT 'MGA',
  `image` varchar(255) DEFAULT NULL,
  `role` enum('admin','user') DEFAULT 'user',
  `date_creation` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id_user`),
  UNIQUE KEY `email` (`email`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id_user`, `nom`, `prenom`, `email`, `mot_de_passe`, `devise`, `image`, `role`, `date_creation`) VALUES
(1, 'Admin', 'User', 'admin@jalako.com', '$2b$10$FqlxBsNJzbGvukKChprKAeWOcLu6xd9GVWvaD8s0ThSM.e/tmO6oq', 'MGA', NULL, 'admin', '2025-08-25 10:04:39'),
(2, 'RAKOTO', 'Andry', 'andry@example.com', '$2b$10$uS0RBiqtkMg50zXYKJNm5OLz8INS9euAcoDoYlZBQWhl5dMfSAPsq', 'MGA', NULL, 'user', '2025-08-26 11:27:15'),
(3, 'Friscoh', 'Eliah', 'friscoh@gmail.com', '$2b$10$3YFHRinPai7ou5n/iKKiwOrFUZyYeWQwb9d4TEix/8NdNSL.MCOb6', 'MGA', NULL, 'user', '2025-09-05 14:27:20'),
(4, 'José', 'RAKOTO', 'jose@gmail.com', '$2b$10$UgBTeT5IKH5uOt3ThTLmE.nMaO4XsROrt.RnMxYDYvFyT4M3JdTPi', 'MGA', NULL, 'user', '2025-09-17 14:27:13');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
