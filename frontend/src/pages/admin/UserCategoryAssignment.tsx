import { useState, useEffect } from 'react';
import { getUsers, assignUserToCategories, getUserCategories, getAdminCategories } from '../../api/admin.api';
import './UserCategoryAssignment.css';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Category {
  id: string;
  name: string;
}

export default function UserCategoryAssignment() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userCategories, setUserCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Filter users based on search query (case-insensitive)
    const query = searchQuery.toLowerCase();
    const filtered = users.filter(u =>
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query)
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, categoriesData] = await Promise.all([
        getUsers({ limit: 1000 }),
        getAdminCategories(),
      ]);
      
      const usersList = usersData?.users || usersData || [];
      // Show ALL users (including super_admin) - filtering happens in display logic
      setUsers(usersList);
      setFilteredUsers(usersList);
      setCategories(Array.isArray(categoriesData) ? categoriesData : categoriesData?.categories || []);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = async (user: User) => {
    // Prevent selection if user is super_admin
    if (user.role === 'super_admin') {
      return;
    }
    
    console.debug('[UserCategoryAssignment] Selecting user:', { id: user.id, name: user.name, role: user.role });
    
    setSelectedUser(user);
    setUserCategories([]); // Clear previous selection immediately
    
    try {
      const cats = await getUserCategories(user.id);
      console.debug('[UserCategoryAssignment] Retrieved categories for user:', {
        userId: user.id,
        role: user.role,
        categoriesLength: cats.length,
        categoryIds: cats.map((c: any) => c.id),
        rawData: cats
      });
      
      const categoryIds = cats.map((c: any) => c.id);
      setUserCategories(categoryIds);
      
      console.debug('[UserCategoryAssignment] State updated with categories:', categoryIds);
    } catch (err) {
      console.error('[UserCategoryAssignment] Failed to load user categories:', err);
      setUserCategories([]);
    }
  };

  const toggleCategory = (categoryId: string) => {
    console.debug('[UserCategoryAssignment] Toggle category:', {
      categoryId,
      selectedUser: selectedUser?.id,
      currentCategories: userCategories,
      isCurrentlySelected: userCategories.includes(categoryId)
    });
    
    setUserCategories(prev => {
      const updated = prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId];
      
      console.debug('[UserCategoryAssignment] New categories state:', updated);
      return updated;
    });
  };

  const handleSave = async () => {
    if (!selectedUser || userCategories.length === 0) {
      alert('Please select at least one category');
      return;
    }

    console.debug('[UserCategoryAssignment] Saving categories:', {
      userId: selectedUser.id,
      role: selectedUser.role,
      categories: userCategories,
      count: userCategories.length
    });

    setSaving(true);
    try {
      await assignUserToCategories(selectedUser.id, userCategories);
      console.debug('[UserCategoryAssignment] Save successful');
      alert('Categories assigned successfully!');
      // Categories saved successfully - state already reflects the correct selection
    } catch (err: any) {
      console.error('[UserCategoryAssignment] Failed to assign categories:', err);
      // Revert to backend state on error
      try {
        const cats = await getUserCategories(selectedUser.id);
        const categoryIds = cats.map((c: any) => c.id);
        console.debug('[UserCategoryAssignment] Reverted to backend state:', categoryIds);
        setUserCategories(categoryIds);
      } catch (revertErr) {
        console.error('[UserCategoryAssignment] Failed to revert categories:', revertErr);
      }
      alert(err.response?.data?.message || 'Failed to assign categories');
    } finally {
      setSaving(false);
    }
  };

  // Check if selected user is super_admin
  const isSuperAdmin = selectedUser?.role === 'super_admin';

  if (loading && users.length === 0) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{
      padding: '40px',
      background: '#f8fafc',
      minHeight: '100vh',
      fontFamily: 'Inter, sans-serif',
    }}>
      <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '30px' }}>
        Worker Category Assignment
      </h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '350px 1fr',
        gap: '30px',
      }}>
        {/* User List */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid #e2e8f0',
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: '16px' }}>
            Select User
          </h3>
          
          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '15px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
          />
          
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {filteredUsers.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>
                No users found
              </div>
            ) : (
              filteredUsers.map(user => (
                <div
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    cursor: user.role === 'super_admin' ? 'not-allowed' : 'pointer',
                    background: selectedUser?.id === user.id ? '#eff6ff' : '#f8fafc',
                    border: selectedUser?.id === user.id ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                    opacity: user.role === 'super_admin' ? 0.6 : 1,
                  }}
                >
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>{user.name}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{user.email}</div>
                  <div style={{ fontSize: '11px', color: '#3b82f6', marginTop: '4px' }}>
                    {user.role}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Category Assignment */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '30px',
          border: '1px solid #e2e8f0',
        }}>
          {!selectedUser ? (
            <div style={{
              textAlign: 'center',
              padding: '60px',
              color: '#94a3b8',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>👤</div>
              <p>Select a user to assign categories</p>
            </div>
          ) : isSuperAdmin ? (
            <>
              <div style={{ 
                padding: '20px',
                background: '#fee2e2',
                borderRadius: '12px',
                border: '2px solid #fca5a5',
                marginBottom: '20px',
              }}>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#dc2626', marginBottom: '8px' }}>
                  ⛔ Super Admin users cannot be assigned to categories
                </div>
                <p style={{ margin: 0, fontSize: '14px', color: '#991b1b' }}>
                  Super Admins have access to all categories and tasks by default. Category assignment is only for workers (researchers, inquirers, auditors, etc.).
                </p>
              </div>
              <button
                disabled
                style={{
                  padding: '15px 30px',
                  background: '#d1d5db',
                  color: '#6b7280',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '700',
                  fontSize: '14px',
                  cursor: 'not-allowed',
                  width: '100%',
                }}
              >
                Save Category Assignment (Disabled for Super Admin)
              </button>
            </>
          ) : (
            <>
              <div style={{ marginBottom: '30px' }}>
                <h2 style={{ margin: 0, fontSize: '20px' }}>
                  Assign Categories to: <span style={{ color: '#3b82f6' }}>{selectedUser.name}</span>
                </h2>
                <p style={{ color: '#64748b', fontSize: '14px', marginTop: '5px' }}>
                  Role: {selectedUser.role}
                </p>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '15px',
                marginBottom: '30px',
              }}>
                {categories.map(category => (
                  <div
                    key={category.id}
                    onClick={() => toggleCategory(category.id)}
                    style={{
                      padding: '15px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      background: userCategories.includes(category.id) ? '#3b82f6' : '#f8fafc',
                      color: userCategories.includes(category.id) ? 'white' : '#1e293b',
                      border: userCategories.includes(category.id) ? '2px solid #2563eb' : '1px solid #e2e8f0',
                      fontWeight: '600',
                      fontSize: '14px',
                      transition: 'all 0.2s',
                    }}
                  >
                    {userCategories.includes(category.id) && <span style={{ marginRight: '8px' }}>✓</span>}
                    {category.name}
                  </div>
                ))}
              </div>

              <div style={{
                padding: '20px',
                background: '#eff6ff',
                borderRadius: '12px',
                marginBottom: '20px',
              }}>
                <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
                  Selected Categories: {userCategories.length}
                </div>
                {userCategories.length === 0 && (
                  <div style={{ fontSize: '12px', color: '#ef4444' }}>
                    ⚠️ User must have at least one category to see any tasks!
                  </div>
                )}
              </div>

              <button
                onClick={handleSave}
                disabled={saving || userCategories.length === 0}
                style={{
                  padding: '15px 30px',
                  background: userCategories.length > 0 ? '#3b82f6' : '#94a3b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '700',
                  fontSize: '14px',
                  cursor: userCategories.length > 0 ? 'pointer' : 'not-allowed',
                  width: '100%',
                }}
              >
                {saving ? 'Saving...' : 'Save Category Assignment'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
