-- phpMyAdmin SQL Dump
-- version 5.0.2
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : mer. 08 oct. 2025 à 14:42
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
  PRIMARY KEY (`id_abonnement`),
  KEY `id_user` (`id_user`),
  KEY `idx_abonnements_user` (`id_user`),
  KEY `idx_abonnements_actif` (`actif`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `abonnements`
--

INSERT INTO `abonnements` (`id_abonnement`, `id_user`, `nom`, `montant`, `fréquence`, `prochaine_echeance`, `rappel`, `icon`, `couleur`, `actif`) VALUES
(1, 4, 'Starlink', '130000.00', 'Mensuel', '2026-08-08', 1, 'Tv', '#6B7280', 1),
(2, 4, 'Netflix', '5000.00', 'Mensuel', '2026-01-08', 1, 'Tv', '#EF4444', 1);

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
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `budgets`
--

INSERT INTO `budgets` (`id_budget`, `id_user`, `id_categorie_depense`, `mois`, `montant_max`, `montant_restant`, `pourcentage_utilise`) VALUES
(4, 4, 2, '2025-11', '0.00', '0.00', 0),
(2, 4, 2, '2025-10', '450000.00', NULL, 0),
(3, 4, 1, '2025-10', '45000.00', '45000.00', 0),
(5, 4, 1, '2025-11', '0.00', '0.00', 0);

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
  `solde` decimal(10,2) DEFAULT '0.00',
  `type` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_compte`),
  KEY `id_user` (`id_user`)
) ENGINE=MyISAM AUTO_INCREMENT=9 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `comptes`
--

INSERT INTO `comptes` (`id_compte`, `id_user`, `nom`, `solde`, `type`) VALUES
(1, 1, 'Compte principal', '0.00', 'courant'),
(2, 1, 'Orange Money', '85000.00', 'Mobile money'),
(3, 2, 'Compte mobile ', '420275.00', 'trading'),
(4, 2, 'Agent de poche', '-45000.00', 'courant'),
(6, 4, 'Mobile money ', '-161800.00', 'trading'),
(7, 8, 'Banque BNI', '500000.00', 'courant'),
(8, 4, 'Compte Famille', '3251000.00', 'epargne');

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
) ENGINE=MyISAM AUTO_INCREMENT=10 DEFAULT CHARSET=latin1;

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
(9, 8, 4, 'proprietaire');

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
) ENGINE=MyISAM AUTO_INCREMENT=21 DEFAULT CHARSET=latin1;

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
(20, 6, 4, '2000.00', '2025-10-08', 8);

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
) ENGINE=MyISAM AUTO_INCREMENT=38 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `depenses`
--

INSERT INTO `depenses` (`id_depense`, `id_user`, `montant`, `date_depense`, `description`, `id_categorie_depense`, `id_compte`) VALUES
(7, 4, '200.00', '2025-10-15', 'rezrezr', 2, 6),
(6, 4, '2000.00', '2025-10-06', 'ffdfdf', 1, 6),
(8, 4, '5000.00', '2025-10-06', 'iuoiuouio', 2, 6),
(11, 4, '5000.00', '2025-10-08', 'fdfdf', NULL, 8),
(12, 4, '2000.00', '2025-10-08', 'Nteflix', NULL, 8),
(13, 4, '2000.00', '2025-10-08', 'Nteflix', NULL, 8),
(14, 4, '2000.00', '2025-10-08', 'Nteflix', NULL, 8),
(15, 4, '5000.00', '2025-10-08', 'sddqsd', NULL, 8),
(16, 4, '5000.00', '2025-10-08', 'sddqsd', NULL, 8),
(17, 4, '5000.00', '2025-10-08', 'sddqsd', NULL, 8),
(18, 4, '5000.00', '2025-10-08', 'sddqsd', NULL, 8),
(19, 4, '5000.00', '2025-10-08', 'sddqsd', NULL, 8),
(20, 4, '5000.00', '2025-10-08', 'sddqsd', NULL, 8),
(21, 4, '5000.00', '2025-10-08', 'fdfdf', NULL, 8),
(22, 4, '5000.00', '2025-10-08', 'fdfdf', NULL, 8),
(23, 4, '5000.00', '2025-10-08', 'fdfdf', NULL, 8),
(24, 4, '130000.00', '2025-10-08', 'StarLink ', NULL, 8),
(25, 4, '130000.00', '2025-10-08', 'Starlink', NULL, 8),
(26, 4, '130000.00', '2025-10-08', 'Starlink', NULL, 8),
(27, 4, '130000.00', '2025-10-08', 'Starlink', NULL, 8),
(28, 4, '130000.00', '2025-10-08', 'Starlink', NULL, 8),
(29, 4, '130000.00', '2025-10-08', 'Starlink', NULL, 8),
(30, 4, '130000.00', '2025-10-08', 'Starlink', NULL, 8),
(31, 4, '130000.00', '2025-10-08', 'Starlink', NULL, 8),
(32, 4, '130000.00', '2025-10-08', 'Starlink', NULL, 8),
(33, 4, '130000.00', '2025-10-08', 'Starlink', NULL, 8),
(34, 4, '130000.00', '2025-10-08', 'Starlink', NULL, 8),
(35, 4, '5000.00', '2025-10-08', 'Netflix', NULL, 8),
(36, 4, '5000.00', '2025-10-08', 'Netflix', NULL, 8),
(37, 4, '5000.00', '2025-10-08', 'Netflix', NULL, 8);

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
  `statut` varchar(50) NOT NULL DEFAULT 'en cours',
  `type` varchar(50) NOT NULL DEFAULT 'personne',
  PRIMARY KEY (`id_dette`),
  KEY `id_user` (`id_user`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

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
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `objectifs`
--

INSERT INTO `objectifs` (`id_objectif`, `id_user`, `nom`, `montant_objectif`, `date_limite`, `montant_actuel`, `pourcentage`, `icone`, `couleur`, `statut`) VALUES
(1, 4, 'Achat  voiture', '50000.00', '2025-10-30', '500200.00', 100, 'Car', '#EF4444', 'Atteint'),
(2, 4, 'Voyage', '5000.00', '2025-10-17', '4300.00', 100, 'Plane', '#8B5CF6', 'Atteint'),
(3, 4, 'Achat  une maison ', '500.00', '2025-10-10', '500.00', 100, 'Home', '#10B981', 'Atteint'),
(4, 4, 'Achat un moto', '5000.00', '2025-10-17', '23800.00', 100, 'Target', '#6B7280', 'Atteint'),
(5, 4, 'sdfd', '500000.00', '2025-10-31', '224000.00', 1, 'Car', '#6B7280', 'En cours'),
(6, 4, 'fdsfsdgfdfgdfgfd', '200000.00', '2025-10-25', '4000.00', 3, 'Heart', '#EC4899', 'En cours');

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
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

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
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `revenus`
--

INSERT INTO `revenus` (`id_revenu`, `id_user`, `montant`, `date_revenu`, `source`, `id_categorie_revenu`, `id_compte`) VALUES
(1, 4, '2000.00', '2025-10-05', 'salaren 213', 1, 6),
(2, 4, '50000.00', '2025-05-08', 'Salaire ', 5, 6),
(3, 4, '15200.00', '2025-11-06', 'Test', 2, 6);

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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4;

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
(8, 4, 'compte_to_objectif', 8, NULL, NULL, 6, '2000.00', '2025-10-08 15:55:01');

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
  PRIMARY KEY (`id_user`),
  UNIQUE KEY `email` (`email`)
) ENGINE=MyISAM AUTO_INCREMENT=9 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id_user`, `nom`, `prenom`, `email`, `mot_de_passe`, `devise`, `image`, `role`, `date_creation`) VALUES
(1, 'Admin', 'User', 'admin@jalako.com', '$2b$10$FqlxBsNJzbGvukKChprKAeWOcLu6xd9GVWvaD8s0ThSM.e/tmO6oq', 'MGA', NULL, 'admin', '2025-08-25 10:04:39'),
(2, 'RAKOTO', 'Andry', 'andry@example.com', '$2b$10$uS0RBiqtkMg50zXYKJNm5OLz8INS9euAcoDoYlZBQWhl5dMfSAPsq', 'MGA', NULL, 'user', '2025-08-26 11:27:15'),
(3, 'Friscoh', 'Eliah', 'friscoh@gmail.com', '$2b$10$3YFHRinPai7ou5n/iKKiwOrFUZyYeWQwb9d4TEix/8NdNSL.MCOb6', 'MGA', NULL, 'user', '2025-09-05 14:27:20'),
(4, 'TAHINJANAHARY ', 'Marie Angela', 'angela@gmail.com', '$2b$10$YnFoGk2KRpa8vfz5Ia7dH.xAZIO.wzbrJqw46ExWYBK7c2ZNun6Ba', 'MGA', '1759934361054-WhatsApp Image 2025-10-03 at 20.42.33.jpeg', 'user', '2025-09-17 14:27:13'),
(5, 'Ando', 'rakoto', 'ando@gmail.com', '$2b$10$K4ZZe4lYmbncYoYLcG7S1eWmV9T4ID772NETqd8ODuTyy9dPG62C.', 'MGA', NULL, 'user', '2025-10-04 10:26:09'),
(6, 'zazaza', 'zazaza', 'zazaza@example.com', '$2b$10$QhBStbhBfWfxhNDIl/9tMesobB3ZD6QtsnJv79QpIImJ8W4xU7smW', 'MGA', NULL, 'user', '2025-10-04 10:31:00'),
(7, 'sfdsfds', 'fdsfgd', 'fdsfdsfdsfds@gmail.com', '$2b$10$WRQS7AhaY/8vg0sjlqPYiOtsjqbiAdNoHRNDMHnmQY/hOe9KNvTRu', 'JPY', NULL, 'user', '2025-10-04 11:42:27'),
(8, 'Firiscoh', 'Elyah', 'elyah@gmail.com', '$2b$10$a5Ut8.pF7ryLQeua3eaPj.b6Mh3jh9Uthq9BDz4fpXDdyqA4vdaLG', 'MGA', NULL, 'user', '2025-10-06 12:44:03');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
