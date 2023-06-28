import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { faFileExcel } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Form, Button } from "react-bootstrap";
import "../App.css";
import { CSVLink } from "react-csv";

export const MyForm = () => {
  const [file, setFile] = useState(null);
  const { id } = useParams();
  // const [fileShow, setFileShow] = useState(false);

  // const [id, setid] = useState();
  // setid(id);
  const navigate = useNavigate();
  const [mode, setMode] = useState("insert");
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isDirty, isValid },
  } = useForm();
  const [tableData, setTableData] = useState([]); // State to hold the table data
  const [selectedDesignation, setSelectedDesignation] = useState("");
  const [tech, setTech] = useState([]);
  const [selectedTech, setSelectedTech] = useState("");
  const [subTech, setSubTech] = useState([]);
  const [items, setItems] = useState([]);
  const [subTechno,setSubTechno]= useState("")

  const getEmployees = async () => {
    try {
      let result = await axios.get(`http://localhost:3000/api/files/${id}`);
      console.log(result.data, "this is the result data of file");
      setItems(result.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      // Handle the error here (e.g., show an error message to the user)
    }
  };

  console.log(items, "this is the items of the files");

  function generateFilename() {
    const currentDate = new Date().toISOString().slice(0, 10);
    return `Employee Details_${currentDate}.csv`;
  }

  const filename = generateFilename();
  useEffect(() => {
    if (id) {
      getEmployees();
    }
  }, [id]);
  useEffect(() => {
    /* Patch Values in the Fields */
    const populateFormData = (data) => {
      console.log(data, "this is the data for prepopulate");
      setMode("update");
      Object.keys(data).forEach((key) => {
        if (key === "designation") {
          setSelectedDesignation(data[key]);
        }
        if (key === "technology") {
          setSelectedTech(data[key]);
          console.log(key, data[key], "this is the data of the keys ");
        }
        if (key === "subTechnology") {
          setSubTechno(data[key]);
          console.log(key, data[key], "this is the data of the keys ");
        }
        setValue(key, data[key]);
      });

      if (data.fileName) {
        // Set the file name in the form field
        setValue("file", { 0: { name: data.fileName } });
      }
    };

    /* Fetch Single Data */
    async function fetchSingleProduct() {
      try {
        const response = await axios.get(
          `http://localhost:3001/products/${id}`
        );
        const data = response.data;
        populateFormData(data);
      } catch (error) {
        console.log(error);
      }
    }

    /* Fetch Table Data */
    async function fetchTableData() {
      try {
        const response = await axios.get("http://localhost:3001/products");
        const data = response.data;
        setTableData(data);
      } catch (error) {
        console.log(error);
      }
    }

    if (id) {
      fetchSingleProduct();
    }

    fetchTableData();
  }, [id, setValue]);

  useEffect(() => {
    async function techData(selectedDesignation) {
      const technologies = await axios.get(
        `http://localhost:3001/technologies?designation=${selectedDesignation}`
      );
      const data = technologies.data;
      console.log(data, "this is the available technologies");
      if (selectedDesignation) {
        setTech(data[0].technologies);
      }
    }
    techData(selectedDesignation);
  }, [selectedDesignation]);

  useEffect(() => {
    async function subtechData(selectedTech) {
      const technologies = await axios.get(
        `http://localhost:3001/sub-technologies?technology=${selectedTech}`
      );
      const data = technologies.data;
      console.log(data, "this is the available technologies");
      if (selectedTech) {
        setSubTech(data[0].subTechnologies);
      }
    }
    subtechData(selectedTech);
  }, [selectedTech, selectedDesignation]);

  /* insert & update API integration */
  const onSubmit = async (data) => {
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
        "Access-Control-Allow-Origin": "*",
      },
    };
    console.log(data, "this is the data");
    const formData = new FormData();
    formData.append("file", file);
    if (!id) {
      axios
        .post("http://localhost:3001/products", data)
        .then(async (response) => {
          console.log(response, "this is the proper response", response.data.id);
          alert("Data added successfully");
          const newid = await response.data.id;
          if(newid){
            const uploadUrl = `http://localhost:3000/api/upload?userId=${newid}`;
            const respo = await axios.post(uploadUrl, formData ,config );
            console.log(respo.data, "this is the data of file uploading");
            reset();
            navigate("/");
          }
         
        })
        .catch((error) => console.log(error));
    } else {
      axios
        .put("http://localhost:3001/products/" + id, data)
        .then(async (res) => {
          console.log(res,"response of the data",id)
          const uploadUrl = `http://localhost:3000/api/upload?userId=${id}`;
            const respo = await axios.post(uploadUrl, formData ,config );
            console.log(respo.data, "this is the data of file uploading");
            alert("Data updated successfully");
            reset();
            navigate("/"); 
        })
        .catch((error) => console.log(error));
    }
  };

  /* Cancel Operation */
  const cancel = () => {
    navigate("/");
  };

  console.log(tableData, mode, "this is the table data");
  console.log(tech, "this is hte tech values");

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="m-2">
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3">
          <div className="col">
            <label>Employee Name</label>
            <Form.Control
              type="text"
              {...register("empName", { minLength: 2, required: true })}
              className="pl-5"
            />
            {errors.empName && errors.empName.type === "required" && (
              <span>Employee Name can't be blank</span>
            )}
            {errors.empName && errors.empName.type === "minLength" && (
              <span>Employee Name must hold at least 2 characters</span>
            )}
          </div>

          <div className="col">
            <label>Email</label>
            <Form.Control
              type="email"
              {...register("empEmail", {
                required: true,
                pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              })}
              className="pl-5"
            />
            {errors.empEmail && errors.empEmail.type === "required" && (
              <span>Email can't be blank</span>
            )}
            {errors.empEmail && errors.empEmail.type === "pattern" && (
              <span>Invalid email address</span>
            )}
          </div>

          <div className="col">
            <label>Password</label>
            <Form.Control
              type="password"
              {...register("password", { required: true })}
              className="pl-5"
            />
            {errors.password && errors.password.type === "required" && (
              <span>Password can't be blank</span>
            )}
          </div>

          <div className="col">
            <label>Gender</label>
            <Form.Control
              as="select"
              {...register("gender", { required: true })}
              className="pl-5"
            >
              <option value="">--Select--</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </Form.Control>
            {errors.gender && errors.gender.type === "required" && (
              <span>Please select a gender</span>
            )}
          </div>
          <div className="col">
            <label htmlFor="designation">Designation</label>
            <select
              {...register("designation", { required: true })}
              className="my-select pl-5 form-control"
              onChange={(e) => setSelectedDesignation(e.target.value)}
            >
              <option value="">--Select--</option>
              <option value="senior">Senior</option>
              <option value="junior">Junior</option>
              <option value="developer">Developer</option>
            </select>
            {errors.designation && errors.designation.type === "required" && (
              <span className="my-error">Designation can't be blank</span>
            )}
          </div>

          <div className="col">
            <label htmlFor="technology">Technology</label>
            <select
              id="technology"
              {...register("technology", { required: true })}
              className="my-select pl-5 form-control"
              onChange={(e) => setSelectedTech(e.target.value)}
              value={selectedTech}
            >
              {id ? <>
              {tech.map((item) => (
                <>
                {item === selectedTech ? <option key={item} value={item}>
                {item}
              </option> :    <option key={item} value={item}>
                  {item}
                </option>}
                </>
              
              ))}
              </> : <>
              <option value="">--Select--</option>
              {tech.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
              </>}
             
            </select>
            {errors.technology && errors.technology.type === "required" && (
              <span className="my-error">technology can't be blank</span>
            )}
          </div>

          <div className="col">
            <label htmlFor="subTechnology">Sub-Technology</label>
            <select
              id="subTechnology"
              {...register("subTechnology", { required: true })}
              className="my-select pl-5 form-control"
              onChange={(e)=>{setSubTechno(e.target.value)}}
              value={subTechno}
            >
              {id? <>  
              {subTech.map((item) => (
                <>
                {item === subTechno ? <option key={item} value={item}>
                {subTechno}
              </option> : <option key={item} value={item}>
                {item}
              </option>}
              </>
              ))}</> :
              <>
              <option value="">--Select--</option>
              {subTech.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
              </>
              }
            
            </select>
          </div>

          <div className="col">
            <label>Date</label>
            <Form.Control
              type="date"
              {...register("date", { required: true })}
              className="pl-5"
            />
            {errors.date && errors.date.type === "required" && (
              <span>Date can't be blank</span>
            )}
          </div>

          <div className="col">
            <label>File</label>
            <Form.Control
              type="file"
              {...register("file")}
              className="pl-5"
              onChange={(e) => {
                setFile(e.target.files[0]);
              }}
            />
          </div>
          {id ?     <CSVLink
            data={items}
            filename={filename}
            className="btn btn-sm btn-success bu download-btn mt-3"
          >
            Download File &nbsp; &nbsp;
            <FontAwesomeIcon icon={faFileExcel} />
          </CSVLink> : ""}
      
        </div>
      </div>
      <div className="mt-3">
        {mode === "insert"? 
        <>
        <Button type="submit" disabled={!isDirty || !isValid} className="but">
          Add
        </Button>
        <Button variant="secondary" onClick={() => cancel()} className="but">
          Cancel
        </Button>
        </>:<>
        <Button type="submit" className="but">
            Update
        </Button>
        <Button variant="secondary" onClick={() => cancel()} className="but">
          Cancel
        </Button>
        </> }
       
      </div>
    </form>
  );
};