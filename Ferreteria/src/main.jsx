import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import {mockUsers} from './constants/mockUsers'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles.css'
import { TiendaProvider } from './context/TiendaContext.jsx'
import { Auth0Provider } from "@auth0/auth0-react";

if (!localStorage.getItem('users')) {
  localStorage.setItem('users', JSON.stringify(mockUsers))
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
  <Auth0Provider
    domain='dev-vx0d4nhti2zb58wx.us.auth0.com'
    clientId='YPVzTmCg1hoHReiS9q6moERaTtvr0w7r'
    authorizationParams={{ redirect_uri: window.location.origin,
    audience:"https://api.ferreteria.com"
    }}
  >
    
    <TiendaProvider>
      <App />
    </TiendaProvider>
  </Auth0Provider>
  </StrictMode>,
)
