import { Outlet, NavLink, useNavigate } from 'react-router-dom'

export default function AdminLayout() {
  var navigate = useNavigate()

  function logout() {
    localStorage.removeItem('ayurthon_admin_token')
    navigate('/admin/login')
  }

  var links = [
    { to: '/admin/dashboard', label: '🏠 Home'    },
    { to: '/admin/upload',    label: '📤 Upload'  },
    { to: '/admin/questions', label: '📚 Bank'    },
    { to: '/admin/builder',   label: '🏗️ Builder' },
    { to: '/admin/tests',     label: '📋 Tests'   }
  ]

  return (
    <>
      <nav className="navbar">
        <a className="navbar-brand">🌿 Ayur<span>thon</span> Admin</a>
        <div className="navbar-links">
          {links.map(function(l) {
            return (
              <NavLink key={l.to} to={l.to}
                className={function(s) { return 'nav-link' + (s.isActive ? ' active' : '') }}>
                {l.label}
              </NavLink>
            )
          })}
          <button onClick={logout} className="nav-link"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.8)' }}>
            🚪 Logout
          </button>
        </div>
      </nav>
      <div className="container page">
        <Outlet />
      </div>
    </>
  )
}
