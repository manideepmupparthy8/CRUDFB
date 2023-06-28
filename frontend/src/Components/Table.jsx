import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Table, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faPlus,
  faFileExcel,
} from "@fortawesome/free-solid-svg-icons";
import { Pagination } from "./Paginations";
import { CSVLink } from "react-csv";

export const TableComponent = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortedColumn, setSortedColumn] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(2);

  /* Edit Employee data */
  const handleEdit = (id) => {
    navigate(`/employee/${id}`);
  };

  /* file download of individual employee */


  /* Get Employees data */
  const getEmployees = async () => {
    let result = await axios.get("http://localhost:3001/products");
    setItems(result.data);
  };

  /* Delete Employees data */
  const deleteEmployee = async (id) => {
    await axios
      .delete(`http://localhost:3001/products/${id}`)
      .then((response) => {
        setItems(items.filter((item) => item.id !== id));
        alert("Data deleted successfully");
        navigate("/");
      })
      .catch((error) => console.log(error));
  };

  /* Display data in the initial load */
  useEffect(() => {
    getEmployees();
  }, []);

  /* 
    Search, Sorting & Pagination
    */
  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const handleSort = (column) => {
    if (column === sortedColumn) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortedColumn(column);
      setSortOrder("asc");
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = items
    .filter((row) => {
      const values = Object.values(row).join("").toLowerCase();
      return values.includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => {
      const aValue = a[sortedColumn];
      const bValue = b[sortedColumn];
      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    })
    .slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  /* 
    React-CSV Code
    */
  const ignoredColumns = ["id", "password"];

  const filteredData = items.map((item) => {
    const filteredItem = { ...item };
    ignoredColumns.forEach((column) => delete filteredItem[column]);
    return filteredItem;
  });

  const headers = [
    { label: "Employee Name", key: "empName" },
    { label: "Email", key: "empEmail" },
    { label: "Gender", key: "gender" },
    { label: "Designation", key: "designation" },
    { label: "Technologies", key: "technologies" },
  ];

  function generateFilename() {
    const currentDate = new Date().toISOString().slice(0, 10);
    return `Employee Details_${currentDate}.csv`;
  }

  const filename = generateFilename();
  const handleFile = async (id) => {
    try {
      let result = await axios.get(`http://localhost:3000/api/files/${id}`, {
        responseType: 'blob',
      });
      console.log(result.data, "this is the result data of file");

      const contentType = result.headers['content-type'];
      const fileExtension = contentType.split('/')[1];

      const downloadUrl = URL.createObjectURL(result.data);

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `file.${fileExtension}`;
      link.target = '_blank';

      const dispositionHeader = result.headers['content-disposition'];
      if (dispositionHeader) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(dispositionHeader);
        if (matches != null && matches[1]) {
          const filename = matches[1].replace(/['"]/g, '');
          link.download = filename;
        }
      }

      link.click();

      link.remove();
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error fetching file data:", error);
      // Handle the error here (e.g., show an error message to the user)
    }
  };

  return (
    <div>
      <h1>Employee details</h1>
      <div className="d-flex justify-content-end">
        <Link to={"employee/"} className="btn btn-sm btn-info mr-1 bu">
          <FontAwesomeIcon icon={faPlus} />
        </Link>
        <CSVLink
          data={filteredData}
          headers={headers}
          filename={filename}
          className="btn btn-sm btn-success bu"
        >
          <FontAwesomeIcon icon={faFileExcel} />
        </CSVLink>
      </div>
      <br></br>
      <Form.Control
        type="text"
        placeholder="Search..."
        onChange={handleSearch}
        className="search"
      />
      <Table striped bordered hover responsive size="sm">
        <thead>
          <tr>
            <th>#</th>
            <th onClick={() => handleSort("empName")}>Name</th>
            <th onClick={() => handleSort("empEmail")}>Email</th>
            <th onClick={() => handleSort("gender")}>Gender</th>
            <th onClick={() => handleSort("designation")}>Designation</th>
            <th onClick={() => handleSort("technologies")}>Technologies</th>
            <th onClick={() => handleSort("subTechnology")}>SubTechnology</th>
            <th onClick={() => handleSort("file")}>Download File</th>
            <th style={{ width: "80px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((item, index) => {
            return (
              <tr key={item.id}>
                <td>{indexOfFirstItem + index + 1}</td>
                <td>{item.empName}</td>
                <td>{item.empEmail}</td>
                <td>{item.gender}</td>
                <td>{item.designation}</td>
                <td>{item.technology}</td>
                <td>{item.subTechnology}</td>
                <td>
                <button className="btn btn-sm btn-success mr-1" onClick={() => handleFile(item.id)}>Download File</button>
                </td>
                <td style={{ width: "80px" }}>
                  <button
                    onClick={() => {
                      deleteEmployee(item.id);
                    }}
                    className="btn btn-sm btn-danger mr-1"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                  <button
                    onClick={() => handleEdit(item.id)}
                    className="btn btn-sm btn-primary mr-1"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
      <Pagination
        itemsPerPage={itemsPerPage}
        totalItems={items.length}
        paginate={paginate}
        currentPage={currentPage}
      />
    </div>
  );
};
