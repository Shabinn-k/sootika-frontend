import React from 'react'
import image from '../assets/Image'
import { Link } from 'react-router-dom'
import "./Footer.css";

const Footer = () => {
    return (
        <div className='footer'>
            <div className="footer-content">

                <div className="footer-content-left">
                    <img src={image.logo} width={100} alt="Sootika Logo" className='logg' />

                    <p>
                        Sootika is a celebration of timeless elegance, bringing together
                        the rich traditions of women’s ethnic fashion with modern comfort.
                        <b> We believe every woman deserves to feel graceful and confident. </b>
                        Our curated collection includes sarees, kurtis, lehengas, and more
                        crafted with detail, beauty, and cultural pride.
                    </p>

                    <div className="footer-social-icons">
                        <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer">
                            <img src={image.instagram} alt="Instagram" width={25} />
                        </a>
                        <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer">
                            <img src={image.facebook} alt="Facebook" width={25} />
                        </a>
                        <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer">
                            <img src={image.linked} alt="LinkedIn" width={23} />
                        </a>
                    </div>
                </div>

                <div className="footer-content-center">
                    <h2>COMPANY</h2>
                    <ul>
                        <Link to="/"><li>Home</li></Link>
                        <Link to="/about"><li>About</li></Link>
                        <li>Help</li>
                        <li>Privacy Policy</li>
                    </ul>
                </div>

                <div className="footer-content-right">
                    <h3>GET IN TOUCH</h3>
                    <ul>
                        <li>+91 9995977246</li>
                        <li>sootika000@gmail.com</li>
                    </ul>
                </div>
            </div>

            <hr />

            <p className='footer-copy'>
                © 2025 Sootika. All rights reserved.
            </p>
        </div>
    )
}

export default Footer
