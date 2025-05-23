import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Navigation from '../Navigation/Navigation';
import { useDispatch } from 'react-redux';
import authSlice from "../../store/slices/auth";
import UserInfo from './UserInfo';
import ChangePassword from './ChangePassword';
import NotificationSettings from './NotificationSettings';
import SchoolInfo from './SchoolInfo';
import ClassesInfo from './ClassesInfo';
import ChildrenInfo from './ChildrenInfo';
import SelectAccountType from './SelectAccountType';
// import VerifyEmail from './VerifyEmail';
import {createMenuDiv} from '../../Utils/utils';
import Spinner from '../Spinner/Spinner';
import PageTitle from '../UI/PageTitle';

const teacher_menu_items = ["User Details", "Change Password", "Settings", "School", "Classes"]
const parent_menu_items = ["User Details", "Change Password", "Settings", "Children"]

const Profile = () => {

    const dispatch = useDispatch();

    // STATE
    const token = useSelector((state) => state.auth.token);
    const [loading, setLoading] = useState(true);
    const [schoolList, setSchoolList] = useState([]);
    const [profile, setProfile] = useState({
        username: "",
        first_name: "",
        last_name: "",
        email: "",
        email_verified: null,
        parent: null,
        teacher: null
    });
    const [notificationSettings, setNotificationSettings] = useState(null);

    // menu - which component to show
    const [componentToShow, setComponentToShow] = useState("User Details");

    // GET USER PROFILE REQUEST
    const getUserProfile = useCallback(() => {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Token ' + token
        };

        axios.get(`${process.env.REACT_APP_API_URL}/api/v1/dj-rest-auth/user/`, {headers: headers})
            .then(res=>{
                setProfile(res.data);
                console.log(res.data)
                // determine account type (teacher or parent)
                let accountType = null;
                 if (res.data.teacher !== null) {
                    accountType = "teacher"
                } else if (res.data.parent !== null) {
                    accountType = "parent"
                }
                dispatch(authSlice.actions.setAccount({account: res.data, accountType}));
                setNotificationSettings(res.data.settings);
            })
            .catch(err=>{
                console.log(err);
            })
            .finally(()=>{
                setLoading(false);
            })
    }, [token, dispatch]);

    // GET SCHOOLS LIST REQUEST
    const getSchoolList = useCallback(() => {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Token ' + token
        };

        axios.get(`${process.env.REACT_APP_API_URL}/api/v1/school/school-list-create/`, {headers: headers})
            .then(res=>{
                setSchoolList(res.data);
            })
            .catch(err=>{
                console.log(err);
            })
    }, [token])

    // ON COMPONENT MOUNT, GET USER'S PROFILE DATA FROM API, GET LIST OF SCHOOLS
    useEffect(()=>{
        getUserProfile()
        getSchoolList()
    }, [getUserProfile, getSchoolList]);


    // JSX
    let profile_div = null;
    let menu_div = null;
    // USER MUST VERIFY EMAIL TO SEE PROFILE -- REMOVED AS WANT DEMO APP TO BE MORE ACCESSIBLE
    // if (profile.email_verified === false) {
    //     profile_div = <VerifyEmail />
    // } else if (profile.email_verified === true) {

    // NO ACCOUNT TYPE CHOSEN YET
    if (profile.teacher === null && profile.parent === null) {
        profile_div = (
            <div>
                <SelectAccountType getUserProfile={getUserProfile} />
            </div>
        )
    }
    // TEACHER ACCOUNT
    else if (profile.teacher !== null) {

        menu_div = createMenuDiv(teacher_menu_items, componentToShow, setComponentToShow)

        profile_div = (
            <div>
                {componentToShow === "User Details" ? <UserInfo profile={profile} getUserProfile={getUserProfile} /> : null}
                {componentToShow === "Change Password" ? <ChangePassword /> : null}
                {componentToShow === "Settings" ? <NotificationSettings profile={profile} settings={notificationSettings} getUserProfile={getUserProfile} /> : null}
                {componentToShow === "School" ? <SchoolInfo profile={profile} schools={schoolList} getUserProfile={getUserProfile} getSchoolList={getSchoolList} /> : null}
                {componentToShow === "Classes" ? <ClassesInfo profile={profile} getUserProfile={getUserProfile} /> : null}
            </div>
        )
    } 

    // PARENT ACCOUNT 
    else if (profile.parent !== null) {

        menu_div = createMenuDiv(parent_menu_items, componentToShow, setComponentToShow)

        profile_div = (
            <div>
                {componentToShow === "User Details" ? <UserInfo profile={profile} getUserProfile={getUserProfile} /> : null}
                {componentToShow === "Change Password" ? <ChangePassword /> : null}
                {componentToShow === "Settings" ? <NotificationSettings profile={profile} settings={notificationSettings} getUserProfile={getUserProfile} /> : null}
                {componentToShow === "Children" ? <ChildrenInfo profile={profile} getUserProfile={getUserProfile} /> : null}
            </div>
        )
    }
    // }

    return (
        <div className="relative bg-white h-screen overflow-auto">
            <Navigation />
            <div className="bg-slate-100 h-[calc(100%-80px)] w-full flex flex-col items-center justify-start">
                <PageTitle title="Profile" />

                {loading ? <Spinner /> : null}

                {
                    !loading && 
                    <>
                        {menu_div}
                        <div className="w-full sm:w-[600px] text-center">
                            {profile_div}
                        </div>
                    </>
                }
                
            </div>
        </div>
    );
}

export default Profile;
