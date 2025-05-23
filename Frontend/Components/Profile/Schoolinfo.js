import { useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import {useMessage} from '../../Hooks/useMessage';
import AddSchool from "./AddSchool";
import SubmitBtn from "../UI/SubmitBtn";

const SchoolInfo = (props) => {

    const token = useSelector((state)=>state.auth.token);

    const [selectedSchool, setSelectedSchool] = useState("");
    const [message, setMessage] = useMessage();
    const [loading, setLoading] = useState(false);

    // Handler to send request to change teacher's school
    const submitSelectSchoolHandler = () => {
        if (selectedSchool !== "" && props.profile.teacher !== null) {
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': 'Token ' + token
            };
            const data = {
                school: selectedSchool,
            };
            setLoading(true);
            axios.put(`${process.env.REACT_APP_API_URL}/api/v1/school/teacher-school-update/`, data, {headers: headers})
                .then(res => {
                    console.log(res);
                    props.getUserProfile();
                    setMessage("School updated successfully.")
                })
                .catch(err => {
                    console.log(err);
                    setMessage("There was a problem updating your school.")
                })
                .finally(()=>{
                    setLoading(false);
                })
        }
    }

    // SCHOOL LIST DROPDOWN
    let dropdown_items = props.schools.map((school)=>{
        return (
            <option key={school.id} value={school.id}>{school.name}</option>
        );
    })
    let dropdown = (
        <select className="border border-gray-300 cursor-pointer mr-2" value={selectedSchool} onChange={e=>setSelectedSchool(e.target.value)}>
            <option value={null}>Select School</option>
            {dropdown_items}
        </select>
    )

    let submit_btn = (
        <SubmitBtn
            loading={loading}
            textContent="Submit"
            clickHandler={submitSelectSchoolHandler}
        />
    )

    let select_school_div = (
        <div className="pb-2 flex justify-center">
            {dropdown} <br/>
            {submit_btn}
        </div>
    )

    let school_info_div = (
        <div className="rounded-md shadow-md bg-white mt-2 mb-4 p-4 min-h-[250px]">
            <h2 className="text-base text-gray-500">Your School</h2>
            <h2 className="pb-2">{props.profile.teacher.school === null ? "You do not have a school yet!" : props.profile.teacher.school.name}</h2>
            {select_school_div}
            <p className="text-sm">{message}</p>
            <div className="border-b-2 border-gray-300 my-2"></div>
            <p className="mt-2">Don't see your school in the list?</p>
            <AddSchool getSchoolList={props.getSchoolList} />
        </div>
    )

    return school_info_div;
}

export default SchoolInfo;
