import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

function BasicNavbar() {
  return (
    <>
      <Navbar bg="dark" variant="dark" sticky="top" fixed="top" >
        <Container>
          <Navbar.Brand href="#home">Project</Navbar.Brand>
          <Nav className="justify-content-end flex-grow-1 pe-3">
            <Nav.Link href="#pieChart">Donut chart</Nav.Link>
            <Nav.Link href="#heatmap">Heatmap</Nav.Link>
            <Nav.Link href="#mixedChart">Mixed Chart</Nav.Link>
            <Nav.Link href="#rangeChart">Range Chart</Nav.Link>
            <Nav.Link href="#bubbleChart">Bubble Chart</Nav.Link>
          </Nav>
        </Container>
      </Navbar>
      

      
    </>
  );
}

export default BasicNavbar;