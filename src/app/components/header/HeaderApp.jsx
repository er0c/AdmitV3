import '../../css/header.css';
/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { auth } from '@/app/firebase';

function HeaderApp({ completedApplications, totalScholarshipAmount }){
    const user = auth.currentUser;
    return(
        <nav>
            <ul className ="header-nav-items">
                {user ? (
                    <li>
                        <Link href="/Profile">
                            <img src={user.photoURL} alt="User pic" style={{borderRadius: '50%', width: "31px", height: "31px"}}/>
                        </Link>
                    </li>
                ) : <img src="/userprofile.png" alt="User pic" style={{borderRadius: '50%', width: "31px", height: "31px"}}/>}
                <li>
                    <img src="/emailsend.png" alt="Application sent"/>
                    <span>{completedApplications}</span>
                </li>
                <li>
                    <img src= "/moneybag.png" alt="Scholarship won"/>
                    <span>${totalScholarshipAmount ? totalScholarshipAmount : '0'}</span>
                </li>
                <li>
                    <img src="/lightning.png" alt="Admit Plus"/>
                </li>
            </ul>
        </nav>
    );
  }

export default HeaderApp;