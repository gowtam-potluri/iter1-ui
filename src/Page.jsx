import React from 'react';
import {
  Navbar, Nav, NavItem, NavDropdown,
  MenuItem, Glyphicon,Grid,
} from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import Contents from './Contents.jsx';
import IssueAddNavItem from './IssueAddNavItem.jsx';
import PatIssueAddNavItem from './PatIssueAddNavItem.jsx';



function NavBar() {
  
  return (
    
    <Navbar fluid>
      <Navbar.Header>
        <Navbar.Brand>COVID Resources</Navbar.Brand>
      </Navbar.Header>
      <Nav>
        <LinkContainer exact to="/">
          <NavItem>Home</NavItem>
        </LinkContainer>
        <LinkContainer to="/issues">
          <NavItem>Resources List</NavItem>
        </LinkContainer>
        <LinkContainer to="/patients">
          <NavItem>Patients List</NavItem>
        </LinkContainer>
      </Nav>
      <Nav pullRight>
 
          {window.location.pathname== '/issues' && <IssueAddNavItem/>}
          {window.location.pathname== '/patients' && <PatIssueAddNavItem/>}

        <NavDropdown
          id="user-dropdown"
          title={<Glyphicon glyph="option-vertical" />}
          noCaret
        >
          <MenuItem>About</MenuItem>
        </NavDropdown>
      </Nav>
    </Navbar>
  );
}

function Footer() {
  return (
    <small>
      <hr/>
      <p className="text-center">
        Full source code available at this
        {' '}
        <a href="https://github.com/vasansr/pro-mern-stack-2">
          GitHub repository
        </a>
      </p>
    </small>
  );
}

export default function Page() {
  return (
    <div>
      <NavBar />
      <Grid fluid>
        <Contents />
      </Grid>
      <Footer/>
    </div>
  );
}