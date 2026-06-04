import { Outlet, NavLink, useNavigate } from 'react-router-dom'

export default function AdminLayout() {
  const navigate = useNavigate()

  function logout() {
    localStorage.removeItem('ayurthon_admin_token')
    navigate('/admin/login')
  }

  return (
    <>
      <nav className="navbar">
        <a className="navbar-brand">🌿 Ayur<span>thon</span> Admin</a>
        <div className="navbar-links">
          <NavLink to="/admin/upload"    className={({isActive}) => 'nav-link' + (isActive ? ' active' : '')}>📤 Upload</NavLink>
          <NavLink to="/admin/questions" className={({isActive}) => 'nav-link' + (isActive ? ' active' : '')}>📚 Bank</NavLink>
          <NavLink to="/admin/builder"   className={({isActive}) => 'nav-link' + (isActive ? ' active' : '')}>🏗️ Builder</NavLink>
          <NavLink to="/admin/tests"     className={({isActive}) => 'nav-link' + (isActive ? ' active' : '')}>📋 Tests</NavLink>
          <button onClick={logout} className="nav-link btn" style={{background:'none',border:'none',cursor:'pointer',color:'rgba(255,255,255,0.8)'}}>🚪 Logout</button>
        </div>
      </nav>
      <div className="container page">
        <Outlet />
      </div>
    </>
  )
}
