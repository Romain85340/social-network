import React, { useContext } from 'react'
import { useSelector } from 'react-redux';
import {NavLink} from 'react-router-dom';
import { UidContext } from './App.Context'
import Logout from './Log/Logout'

export default function Navbar() {
    const uid = useContext(UidContext);
    const userData = useSelector((state) => state.userReducer)

    return (
        <nav>
            <div className="nav-container">
                <div className="logo">
                    <NavLink exact to="/">
                        <div className="logo">
                            <img src="./img/logo.png" alt="icon"/>
                            <h3>Instafake</h3>
                        </div>
                    </NavLink>
                </div>
                {uid ? (
                    <ul>
                        <li></li>
                        <li className="welcome">
                            <NavLink exact to="/profil">
                                <h5>Bienvenue {userData.pseudo}</h5>
                            </NavLink>
                        </li>
                        < Logout />
                    </ul>
                ) : (
                    <ul>
                        <li></li>
                        <li>
                            <NavLink exact to="/profil">
                                <img src="./img/icons/login.svg" alt=""/>
                            </NavLink>
                        </li>
                    </ul>
                )}
            </div>
        </nav>
    )
}
