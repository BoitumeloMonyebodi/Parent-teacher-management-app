import { useState } from "react";
import { useSelector } from "react-redux"
import {useContacts} from '../../Hooks/useContacts';
import { PlusIcon } from "@heroicons/react/outline";
import { filterStudents } from "../../Utils/utils";
import Spinner from "../Spinner/Spinner";

const Contacts = (props) => {

    const token = useSelector((state)=>state.auth.token);
    const account = useSelector((state)=>state.auth.account);
    const [loading, contactList] = useContacts(token, props.accountType);

    const [selectedClass, setSelectedClass] = useState(null);
    const [studentSearchTerm, setStudentSearchTerm] = useState("");

    // List of classes
    let classes_list = null;
    if (contactList !== null) {
        let classes = [];
        classes_list = contactList.map((school_class) => {
            if (!classes.includes(school_class.id)) {
                classes.push(school_class.id);
                let style = "p-1 my-1 w-full border-2 border-gray-200 bg-sky-200 cursor-pointer hover:bg-indigo-500 hover:text-white rounded-md";
                if (selectedClass !== null) {
                    if (selectedClass.id === school_class.id) style = "p-1 my-1 w-full border-2 border-gray-200 bg-sky-500 text-white rounded-md"
                }
                if (props.accountType === "teacher") {
                    return (
                        <div
                            key={school_class.id}
                            className={style}
                            onClick={()=>setSelectedClass(school_class)}
                        >
                            <h4 className="text-base text-left font-semibold truncate">{school_class.name}</h4>
                        </div>
                    )
                } else if (props.accountType === "parent") {
                    return (
                        <div
                            key={school_class.id}
                            className={style}
                            onClick={()=>setSelectedClass(school_class)}
                        >
                            <h4 className="text-base text-left font-semibold truncate">{school_class.name}</h4>
                            <h4 className="text-sm text-left font-semibold truncate">{school_class.child}'s class</h4>
                            <div className="bg-white rounded-md p-1 mt-1 cursor-default">
                                <h4 className="text-xs text-left text-gray-500 font-semibold truncate">Teacher</h4>
                                <div className="flex justify-between items-center text-black">
                                    <h4 className="text-sm text-left font-semibold truncate">{school_class.teacher.user.first_name} {school_class.teacher.user.last_name}</h4>
                                    <PlusIcon className="h-[24px] w-[24px] fill-white cursor-pointer ml-2 hover:stroke-indigo-500" onClick={()=>props.addToListHandler(school_class.teacher)} />
                                    {/* <ChatIcon className="h-[24px] w-[24px] fill-white cursor-pointer ml-2" onClick={()=>sendDirectMessageHandler(school_class.teacher)} /> */}
                                </div>
                            </div>
                        </div>
                    )
                } else {
                    return null;
                }
            } else {
                return null;
            }
        })
    }

    // List of parent's from selected class
    let parents_list = null;
    if (selectedClass !== null) {

        let array = selectedClass.students;

        // if student is being searched for, filter the list
        if (studentSearchTerm.length > 0) array = filterStudents(studentSearchTerm, array);
        
        parents_list = array.map((student) => {
            if (student.parent !== null) {
                // remove user from list (as can't message themselves)
                if (student.parent.user.id === account.id) return null;
                return (
                    <div 
                        key={student.id}
                        className="p-1 my-1 w-full border-2 border-gray-200 bg-sky-200 rounded-md flex flex-wrap justify-between"
                    >
                        <div>
                            <h4 className="text-base text-left font-semibold truncate">{student.name}'s parent</h4>
                            <p className="text-xs text-left text-gray-600 font-semibold truncate">{student.parent.user.first_name} {student.parent.user.last_name}</p>
                        </div>
                        <div className="flex items-center">
                            <PlusIcon className="h-[24px] w-[24px] fill-white cursor-pointer ml-2 hover:stroke-indigo-500" onClick={()=>props.addToListHandler(student.parent)} />
                        </div>
                    </div>
                )
            } else {
                return null;
            }
        })
    }

    let parent_div_message = (
        <div>
            <p className="text-sm text-left pl-1">Select class to show parents list.</p>
            <p className="text-sm text-left pl-1 pt-1">Click icon to add user to group.</p>
        </div>
    )
    
    return (
        <div className="w-full border-b-2 border-gray-300 md:border-0">
            <div className="h-[2.5rem] border-b-2 border-gray-300">
                <h2 className="text-left p-1">Contacts</h2>
            </div>
            <div className="h-[calc(100%-2.5rem)] flex flex-col">  
                <div className="w-full h-1/2 border-gray-300 border-r-0 border-b-2 p-1 overflow-x-auto">
                    <h3 className="text-left text-gray-500 text-base font-semibold pl-1">Your Classes</h3>
                    {loading ? <Spinner /> : <>{classes_list}</>}
                </div>
                <div className="w-full h-1/2 p-1 overflow-x-auto flex flex-col align-start">
                    <h3 className="text-left text-gray-500 text-base font-semibold pl-1">Parents</h3>
                    {selectedClass ? <input onChange={(e)=>setStudentSearchTerm(e.target.value)} placeholder="Type student..." className="border border-gray-500 p-1 rounded-md w-48 ml-1 my-2" /> : null}
                    {selectedClass ? parents_list : parent_div_message}
                </div>
            </div>
        </div>
    )
}

export default Contacts;
