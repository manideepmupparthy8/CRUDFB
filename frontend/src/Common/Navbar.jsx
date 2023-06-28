import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
// import { MyForm } from '../Components/MyForm';
import {MyForm} from '../Components/MyForm'
import { TableComponent } from '../Components/Table';

function Navbar() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path='/' Component={TableComponent}></Route>
          <Route path='/employee/:id?' Component={MyForm}></Route>
        </Routes>
      </BrowserRouter>

    </div>
  )
}

export default Navbar
