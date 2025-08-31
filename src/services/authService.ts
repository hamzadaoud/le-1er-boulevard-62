import { User, UserRole, LoginActivity } from "../types";

// Initialiser les utilisateurs et mots de passe depuis le localStorage
const initUsersStorage = () => {
  if (!localStorage.getItem('users')) {
    const initialUsers: User[] = [
      {
        id: "admin1",
        email: "admin@1erboulevard.com",
        name: "Admin",
        role: "admin",
      },
      {
        id: "agent1",
        email: "agent1@1erboulevard.com",
        name: "Agent 1",
        role: "agent",
      }
    ];
    localStorage.setItem('users', JSON.stringify(initialUsers));
  }
  
  if (!localStorage.getItem('passwords')) {
    const initialPasswords: Record<string, string> = {
      "admin@1erboulevard.com": "admin1967",
      "agent1@1erboulevard.com": "agent123"
    };
    localStorage.setItem('passwords', JSON.stringify(initialPasswords));
  }
};

// Récupérer les utilisateurs et mots de passe
const getUsers = (): User[] => {
  initUsersStorage();
  try {
    return JSON.parse(localStorage.getItem('users') || '[]');
  } catch {
    return [];
  }
};

const getPasswords = (): Record<string, string> => {
  initUsersStorage();
  try {
    return JSON.parse(localStorage.getItem('passwords') || '{}');
  } catch {
    return {};
  }
};

const saveUsers = (users: User[]): void => {
  localStorage.setItem('users', JSON.stringify(users));
};

const savePasswords = (passwords: Record<string, string>): void => {
  localStorage.setItem('passwords', JSON.stringify(passwords));
};

// Nouvelle fonction pour enregistrer les connexions
const registerLogin = (user: User): void => {
  const loginActivities = getStoredLoginActivities();
  const today = new Date().toISOString().split('T')[0];
  
  const newLoginActivity: LoginActivity = {
    id: `login_${Date.now()}`,
    userId: user.id,
    userName: user.name,
    loginTime: new Date(),
    date: today
  };
  
  loginActivities.push(newLoginActivity);
  localStorage.setItem("loginActivities", JSON.stringify(loginActivities));
};

// Fonction pour récupérer les activités de connexion
export const getStoredLoginActivities = (): LoginActivity[] => {
  try {
    return JSON.parse(localStorage.getItem("loginActivities") || "[]");
  } catch {
    return [];
  }
};

export const authenticate = (email: string, password: string): User | null => {
  const users = getUsers();
  const passwords = getPasswords();
  
  console.log('Tentative de connexion avec:', { email, password });
  console.log('Utilisateurs disponibles:', users);
  console.log('Mots de passe stockés:', passwords);
  
  const user = users.find((user) => user.email === email);
  console.log('Utilisateur trouvé:', user);
  
  if (user && passwords[email] === password) {
    console.log('Authentification réussie');
    // Ne jamais stocker le mot de passe dans le localStorage
    localStorage.setItem("currentUser", JSON.stringify(user));
    // Enregistrer la connexion
    registerLogin(user);
    registerActivity(`S'est connecté au système`);
    return user;
  }
  
  console.log('Authentification échouée');
  return null;
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem("currentUser");
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr) as User;
  } catch {
    return null;
  }
};

export const logout = (): void => {
  localStorage.removeItem("currentUser");
};

export const checkIsAdmin = (): boolean => {
  const user = getCurrentUser();
  return user?.role === "admin";
};

export const registerActivity = (action: string): void => {
  const user = getCurrentUser();
  if (!user) return;
  
  const activities = getStoredActivities();
  
  activities.push({
    id: `act_${Date.now()}`,
    userId: user.id,
    userName: user.name,
    action,
    timestamp: new Date()
  });
  
  localStorage.setItem("activities", JSON.stringify(activities));
};

export const getStoredActivities = () => {
  try {
    return JSON.parse(localStorage.getItem("activities") || "[]");
  } catch {
    return [];
  }
};

// Fonctions de gestion des agents (admin seulement)
export const getAllUsers = (): User[] => {
  const user = getCurrentUser();
  if (!user || user.role !== 'admin') {
    throw new Error('Accès refusé: seuls les administrateurs peuvent voir la liste des utilisateurs');
  }
  return getUsers();
};

export const addUser = (email: string, name: string, password: string, role: UserRole = 'agent'): User => {
  const user = getCurrentUser();
  if (!user || user.role !== 'admin') {
    throw new Error('Accès refusé: seuls les administrateurs peuvent ajouter des utilisateurs');
  }
  
  const users = getUsers();
  const passwords = getPasswords();
  
  // Vérifier si l'email existe déjà
  if (users.some(u => u.email === email)) {
    throw new Error('Cet email est déjà utilisé');
  }
  
  const newUser: User = {
    id: `user_${Date.now()}`,
    email,
    name,
    role
  };
  
  const updatedUsers = [...users, newUser];
  const updatedPasswords = { ...passwords, [email]: password };
  
  saveUsers(updatedUsers);
  savePasswords(updatedPasswords);
  
  registerActivity(`A ajouté un nouvel utilisateur: ${name} (${email})`);
  
  return newUser;
};

export const updateUser = (userId: string, email: string, name: string, role: UserRole): User => {
  const user = getCurrentUser();
  if (!user || user.role !== 'admin') {
    throw new Error('Accès refusé: seuls les administrateurs peuvent modifier des utilisateurs');
  }
  
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    throw new Error('Utilisateur non trouvé');
  }
  
  const oldEmail = users[userIndex].email;
  
  // Vérifier si le nouvel email existe déjà (sauf si c'est le même utilisateur)
  if (email !== oldEmail && users.some(u => u.email === email)) {
    throw new Error('Cet email est déjà utilisé');
  }
  
  const updatedUser: User = {
    ...users[userIndex],
    email,
    name,
    role
  };
  
  const updatedUsers = [...users];
  updatedUsers[userIndex] = updatedUser;
  
  // Si l'email a changé, mettre à jour les mots de passe
  if (email !== oldEmail) {
    const passwords = getPasswords();
    const userPassword = passwords[oldEmail];
    delete passwords[oldEmail];
    passwords[email] = userPassword;
    savePasswords(passwords);
  }
  
  saveUsers(updatedUsers);
  
  registerActivity(`A modifié l'utilisateur: ${name} (${email})`);
  
  return updatedUser;
};

export const deleteUser = (userId: string): boolean => {
  const user = getCurrentUser();
  if (!user || user.role !== 'admin') {
    throw new Error('Accès refusé: seuls les administrateurs peuvent supprimer des utilisateurs');
  }
  
  const users = getUsers();
  const userToDelete = users.find(u => u.id === userId);
  
  if (!userToDelete) {
    throw new Error('Utilisateur non trouvé');
  }
  
  // Empêcher la suppression de son propre compte
  if (userToDelete.id === user.id) {
    throw new Error('Vous ne pouvez pas supprimer votre propre compte');
  }
  
  const updatedUsers = users.filter(u => u.id !== userId);
  const passwords = getPasswords();
  delete passwords[userToDelete.email];
  
  saveUsers(updatedUsers);
  savePasswords(passwords);
  
  registerActivity(`A supprimé l'utilisateur: ${userToDelete.name} (${userToDelete.email})`);
  
  return true;
};

export const changeUserPassword = (userId: string, newPassword: string): boolean => {
  const user = getCurrentUser();
  if (!user || user.role !== 'admin') {
    throw new Error('Accès refusé: seuls les administrateurs peuvent changer les mots de passe');
  }
  
  const users = getUsers();
  const targetUser = users.find(u => u.id === userId);
  
  if (!targetUser) {
    throw new Error('Utilisateur non trouvé');
  }
  
  const passwords = getPasswords();
  passwords[targetUser.email] = newPassword;
  savePasswords(passwords);
  
  registerActivity(`A changé le mot de passe de: ${targetUser.name}`);
  
  return true;
};
