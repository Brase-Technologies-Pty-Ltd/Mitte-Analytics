import React from "react";
import "./footer.css";
import { FooterName } from "../../variables";

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <p>&copy; {new Date().getFullYear()} {FooterName} All rights reserved. </p>
    </footer>
  );
};

export default Footer;
