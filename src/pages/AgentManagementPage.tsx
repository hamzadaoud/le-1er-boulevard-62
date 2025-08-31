import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { User, UserRole } from '../types';
import { getAllUsers, addUser, updateUser, deleteUser, changeUserPassword, checkIsAdmin } from '../services/authService';
import { getRevenues } from '../services/cafeService';
import { printThermalRevenueReport } from '../services/thermalRevenueService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserPlus, Edit, Trash2, Key, Users, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AgentManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Formulaire nouvel utilisateur
  const [newUser, setNewUser] = useState({
    email: '',
    name: '',
    password: '',
    role: 'agent' as UserRole
  });

  // Formulaire modification
  const [editUser, setEditUser] = useState({
    email: '',
    name: '',
    role: 'agent' as UserRole
  });

  // Changement de mot de passe
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    const refreshData = () => {
      loadUsers();
    };
    
    refreshData();
    
    // Vérifier les changements toutes les 3 secondes pour synchroniser
    const interval = setInterval(refreshData, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const loadUsers = async () => {
    try {
      const userList = getAllUsers();
      setUsers(userList);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des utilisateurs",
        variant: "destructive",
      });
    }
  };

  const handleAddUser = async () => {
    if (!newUser.email || !newUser.name || !newUser.password) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      await addUser(newUser.email, newUser.name, newUser.password, newUser.role);
      
      toast({
        title: "Succès",
        description: "Utilisateur ajouté avec succès",
      });
      
      setNewUser({ email: '', name: '', password: '', role: 'agent' });
      setIsAddDialogOpen(false);
      loadUsers();
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de l'ajout",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser || !editUser.email || !editUser.name) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      await updateUser(selectedUser.id, editUser.email, editUser.name, editUser.role);
      
      toast({
        title: "Succès",
        description: "Utilisateur modifié avec succès",
      });
      
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      loadUsers();
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la modification",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.name} ?`)) {
      return;
    }

    try {
      setLoading(true);
      await deleteUser(user.id);
      
      toast({
        title: "Succès",
        description: "Utilisateur supprimé avec succès",
      });
      
      loadUsers();
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la suppression",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!selectedUser || !newPassword) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un nouveau mot de passe",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      await changeUserPassword(selectedUser.id, newPassword);
      
      toast({
        title: "Succès",
        description: "Mot de passe modifié avec succès",
      });
      
      setNewPassword('');
      setIsPasswordDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors du changement de mot de passe",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setEditUser({
      email: user.email,
      name: user.name,
      role: user.role
    });
    setIsEditDialogOpen(true);
  };

  const openPasswordDialog = (user: User) => {
    setSelectedUser(user);
    setNewPassword('');
    setIsPasswordDialogOpen(true);
  };

  const handlePrintDailyReport = () => {
    const today = new Date().toISOString().split('T')[0];
    const revenues = getRevenues();
    const todayRevenues = revenues.filter(r => r.date === today);
    const totalRevenue = todayRevenues.reduce((sum, r) => sum + r.amount, 0);
    
    printThermalRevenueReport(todayRevenues, 'day', today, today, totalRevenue);
  };

  if (!checkIsAdmin()) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold text-red-600">Accès refusé</h1>
          <p className="text-gray-600">Seuls les administrateurs peuvent accéder à cette page.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-cafeBlack mb-2">Gestion des Agents</h1>
        <p className="text-gray-600">Gérez les utilisateurs et leurs accès au système</p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-cafeGold" />
          <span className="font-semibold">{users.length} utilisateur(s)</span>
        </div>
        
        <div className="flex gap-4">
          <Button
            onClick={handlePrintDailyReport}
            className="bg-cafeRed text-white hover:bg-red-700"
          >
            <Printer className="h-4 w-4 mr-2" />
            Rapport Journalier
          </Button>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-cafeGold text-black hover:bg-yellow-600">
                <UserPlus className="h-4 w-4 mr-2" />
                Ajouter un agent
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un nouvel agent</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="agent@1erboulevard.com"
                />
              </div>
              <div>
                <Label htmlFor="name">Nom</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nom de l'agent"
                />
              </div>
              <div>
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Mot de passe"
                />
              </div>
              <div>
                <Label htmlFor="role">Rôle</Label>
                <Select value={newUser.role} onValueChange={(value: UserRole) => setNewUser(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="admin">Administrateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleAddUser} 
                disabled={loading}
                className="w-full bg-cafeGold text-black hover:bg-yellow-600"
              >
                {loading ? 'Ajout...' : 'Ajouter'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{user.name}</h3>
                  <p className="text-gray-600">{user.email}</p>
                  <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${
                    user.role === 'admin' 
                      ? 'bg-cafeGold text-black' 
                      : 'bg-gray-200 text-gray-800'
                  }`}>
                    {user.role === 'admin' ? 'Administrateur' : 'Agent'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(user)}
                    className="border-cafeGold text-cafeGold hover:bg-cafeGold hover:text-black"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openPasswordDialog(user)}
                    className="border-cafeGold text-cafeGold hover:bg-cafeGold hover:text-black"
                  >
                    <Key className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteUser(user)}
                    className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog de modification */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editUser.email}
                onChange={(e) => setEditUser(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-name">Nom</Label>
              <Input
                id="edit-name"
                value={editUser.name}
                onChange={(e) => setEditUser(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-role">Rôle</Label>
              <Select value={editUser.role} onValueChange={(value: UserRole) => setEditUser(prev => ({ ...prev, role: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="agent">Agent</SelectItem>
                  <SelectItem value="admin">Administrateur</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleEditUser} 
              disabled={loading}
              className="w-full bg-cafeGold text-black hover:bg-yellow-600"
            >
              {loading ? 'Modification...' : 'Modifier'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de changement de mot de passe */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Changer le mot de passe</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-password">Nouveau mot de passe</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nouveau mot de passe"
              />
            </div>
            <Button 
              onClick={handleChangePassword} 
              disabled={loading}
              className="w-full bg-cafeGold text-black hover:bg-yellow-600"
            >
              {loading ? 'Changement...' : 'Changer le mot de passe'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AgentManagementPage;