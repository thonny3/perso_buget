// Système de traductions pour l'application mobile
export const translations = {
  fr: {
    // Écran de connexion
    login: {
      title: "MyJalako",
      subtitle: "Connectez-vous à votre compte",
      emailPlaceholder: "email@example.com",
      passwordPlaceholder: "••••••••",
      loginButton: "Se connecter",
      loginButtonLoading: "Connexion...",
      forgotPassword: "Mot de passe oublié ?",
      noAccount: "Pas encore de compte ? ",
      registerLink: "S'inscrire",
      googleLogin: "Se connecter avec Google",
      facebookLogin: "Se connecter avec Facebook",
      orDivider: "ou",
      // Messages d'erreur
      emailRequired: "L'email est requis",
      emailInvalid: "Format d'email invalide",
      passwordTooShort: "Le mot de passe doit contenir au moins 6 caractères"
    },
    
    // Écran d'inscription
    register: {
      title: "MyJalako",
      subtitle: "Créez votre compte",
      firstNameLabel: "Prénom",
      firstNamePlaceholder: "Jean",
      lastNameLabel: "Nom",
      lastNamePlaceholder: "Dupont",
      emailLabel: "Email",
      emailPlaceholder: "email@example.com",
      currencyLabel: "Devise",
      passwordLabel: "Mot de passe",
      passwordPlaceholder: "••••••••",
      confirmPasswordLabel: "Confirmer le mot de passe",
      confirmPasswordPlaceholder: "••••••••",
      registerButton: "S'inscrire",
      registerButtonLoading: "Inscription...",
      hasAccount: "Déjà un compte ? ",
      loginLink: "Se connecter",
      googleRegister: "S'inscrire avec Google",
      facebookRegister: "S'inscrire avec Facebook",
      orDivider: "ou",
      // Messages d'erreur
      firstNameRequired: "Le prénom est requis",
      lastNameRequired: "Le nom est requis",
      emailRequired: "L'email est requis",
      emailInvalid: "Format d'email invalide",
      passwordTooShort: "Le mot de passe doit contenir au moins 6 caractères",
      passwordsNotMatch: "Les mots de passe ne correspondent pas"
    },
    
    // Devises
    currencies: {
      MGA: "Ariary Malagasy (Ar)",
      EUR: "Euro (€)",
      USD: "Dollar ($)"
    },
    
    // Messages généraux
    common: {
      loading: "Chargement...",
      error: "Erreur",
      success: "Succès",
      cancel: "Annuler",
      confirm: "Confirmer",
      save: "Enregistrer",
      delete: "Supprimer",
      edit: "Modifier",
      add: "Ajouter",
      close: "Fermer"
    },

    // Écran mot de passe oublié
    forgotPassword: {
      title: "Mot de passe oublié",
      subtitle: "Entrez votre email pour recevoir un lien de réinitialisation",
      emailLabel: "Email",
      emailPlaceholder: "email@example.com",
      sendButton: "Envoyer le lien",
      sendButtonLoading: "Envoi...",
      sendOtpButton: "Envoyer un code OTP",
      sendOtpButtonLoading: "Envoi du code...",
      backToLogin: "Retour à la connexion",
      successMessage: "Si un compte existe, un email de réinitialisation a été envoyé.",
      otpSuccessMessage: "Code OTP envoyé. Vérifiez votre boîte mail.",
      emailRequired: "Veuillez saisir votre email",
      emailInvalid: "Format d'email invalide"
    },

    // Écran réinitialisation mot de passe
    resetPassword: {
      title: "Réinitialiser le mot de passe",
      subtitle: "Entrez votre nouveau mot de passe",
      emailLabel: "Email",
      emailPlaceholder: "email@example.com",
      otpLabel: "Code OTP",
      otpPlaceholder: "123456",
      passwordLabel: "Nouveau mot de passe",
      passwordPlaceholder: "••••••••",
      confirmPasswordLabel: "Confirmer le mot de passe",
      confirmPasswordPlaceholder: "••••••••",
      resetButton: "Réinitialiser",
      resetButtonLoading: "Réinitialisation...",
      backToLogin: "Retour à la connexion",
      successMessage: "Mot de passe réinitialisé avec succès. Vous pouvez vous connecter.",
      tokenRequired: "Lien invalide ou manquant",
      emailRequired: "Email requis",
      emailInvalid: "Format d'email invalide",
      otpRequired: "Code OTP requis",
      otpInvalid: "Code OTP invalide (6 chiffres)",
      passwordTooShort: "Le mot de passe doit contenir au moins 6 caractères",
      passwordsNotMatch: "Les mots de passe ne correspondent pas"
    }
  },
  
  mg: {
    // Écran de connexion (malgache - gardé pour référence)
    login: {
      title: "MyJalako",
      subtitle: "Midira amin'ny kaontinao",
      emailPlaceholder: "email@example.com",
      passwordPlaceholder: "••••••••",
      loginButton: "Hiditra",
      loginButtonLoading: "Miditra...",
      forgotPassword: "Hadino ny teny miafina?",
      noAccount: "Mbola tsy manana kaonty? ",
      registerLink: "Hisoratra anarana",
      googleLogin: "Se connecter avec Google",
      facebookLogin: "Se connecter avec Facebook",
      orDivider: "ou",
      emailRequired: "Ny mailaka dia ilaina",
      emailInvalid: "Ny mailaka dia tsy marina",
      passwordTooShort: "Ny teny miafina dia tokony ho 6 na mihoatra"
    },
    
    // Écran d'inscription (malgache - gardé pour référence)
    register: {
      title: "MyJalako",
      subtitle: "Mamorona ny kaontinao",
      firstNameLabel: "Fanampiny",
      firstNamePlaceholder: "Rakoto",
      lastNameLabel: "Anarana",
      lastNamePlaceholder: "Andry",
      emailLabel: "Mailaka",
      emailPlaceholder: "email@example.com",
      currencyLabel: "Vola",
      passwordLabel: "Teny miafina",
      passwordPlaceholder: "••••••••",
      confirmPasswordLabel: "Hamarino ny teny miafina",
      confirmPasswordPlaceholder: "••••••••",
      registerButton: "Hisoratra anarana",
      registerButtonLoading: "Miditra...",
      hasAccount: "Efa manana kaonty? ",
      loginLink: "Hiditra",
      googleRegister: "S'inscrire avec Google",
      facebookRegister: "S'inscrire avec Facebook",
      orDivider: "ou",
      firstNameRequired: "Ny fanampiny dia ilaina",
      lastNameRequired: "Ny anarana dia ilaina",
      emailRequired: "Ny mailaka dia ilaina",
      emailInvalid: "Ny mailaka dia tsy marina",
      passwordTooShort: "Ny teny miafina dia tokony ho 6 na mihoatra",
      passwordsNotMatch: "Ny teny miafina dia tsy mitovy"
    },
    
    currencies: {
      MGA: "Ariary Malagasy (Ar)",
      EUR: "Euro (€)",
      USD: "Dollar ($)"
    },
    
    common: {
      loading: "Miandry...",
      error: "Tsy mety",
      success: "Tonga soa",
      cancel: "Avelao",
      confirm: "Ekena",
      save: "Tehirizo",
      delete: "Fafao",
      edit: "Ovay",
      add: "Ampio",
      close: "Akatony"
    }
  }
};

// Fonction pour obtenir une traduction
export const getTranslation = (key, language = 'fr') => {
  const keys = key.split('.');
  let translation = translations[language];
  
  for (const k of keys) {
    if (translation && translation[k]) {
      translation = translation[k];
    } else {
      // Fallback vers le français si la traduction n'existe pas
      translation = translations['fr'];
      for (const fallbackKey of keys) {
        if (translation && translation[fallbackKey]) {
          translation = translation[fallbackKey];
        } else {
          return key; // Retourner la clé si aucune traduction trouvée
        }
      }
      break;
    }
  }
  
  return translation;
};

// Langue par défaut
export const DEFAULT_LANGUAGE = 'fr';
