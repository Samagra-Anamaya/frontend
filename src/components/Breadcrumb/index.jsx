import React from "react";
import { MDBBreadcrumb, MDBBreadcrumbItem, MDBContainer } from "mdbreact";
import { map } from "lodash";
import Link from "next/link";
import HomeIcon from "@mui/icons-material/Home";
import { MDBDropdown } from "mdbreact";
import { MDBDropdownToggle } from "mdbreact";
import { MDBDropdownMenu } from "mdbreact";
import { MDBDropdownItem } from "mdbreact";
const Breadcrumb = ({ heading, items }) => {
  return (
    <header className="w-100">
      {/* Heading */}
      <div className="w-100">
        {/* Breadcrumb */}
        <MDBContainer fluid className=" w-100 p-1">
          {heading && <h1>{heading}</h1>}
          <MDBBreadcrumb bold>
            {map(items, (item, index) => (
              <MDBBreadcrumbItem>
                <Link
                  href={item?.to ? item.to : ""}
                  className="text-reset"
                  style={{ fontSize: "17px" }}
                >
                  {index === 0 && (
                    <HomeIcon sx={{ color: "#017922", fontSize: "18px" }} />
                  )}
                  <span
                    style={{
                      color: index === items.length - 1 ? "" : "#017922",
                    }}
                  >
                    {item?.label ? item.label : item}
                  </span>
                </Link>
              </MDBBreadcrumbItem>
            ))}
           
          </MDBBreadcrumb>
        </MDBContainer>
      </div>
    </header>
  );
};

export default Breadcrumb;


// import React from "react";
// import { MDBBreadcrumb, MDBBreadcrumbItem, MDBContainer } from "mdbreact";
// import { map } from "lodash";
// import Link from "next/link";
// import HomeIcon from "@mui/icons-material/Home";
// import { MDBDropdown } from "mdbreact";
// import { MDBDropdownToggle,MDBDropdownMenu,MDBDropdownItem } from "mdbreact";

// const Breadcrumb = ({ heading, items }) => {
//   return (
//     <header className="w-100 p-0 m-0 mb-2 bg-light">
//       {/* Heading */}
//       <div className="w-100 p-0 ">
//         {/* Breadcrumb */}
//         <MDBContainer fluid className="p-0 d-flex justify-content-between">
      
//           <div style={{ width: "90%" }} className="p-0 m-0 ">
//             <MDBBreadcrumb bold style={{background:'none'}} className="pt-2 m-0">
//               {map(items, (item, index) => (
//                 <MDBBreadcrumbItem>
//                   <Link
//                     href={item?.to ? item.to : ""}
//                     className="text-reset"
//                     style={{ fontSize: "17px" }}
//                   >
//                     {index === 0 && (
//                       <HomeIcon sx={{ color: "#017922", fontSize: "18px" }} />
//                     )}
//                     <span
//                       style={{
//                         color: index === items.length - 1 ? "" : "#017922",
//                       }}
//                     >
//                       {item?.label ? item.label : item}
//                     </span>
//                   </Link>
//                 </MDBBreadcrumbItem>
//               ))}
//             </MDBBreadcrumb>
//           </div>
//           <div style={{ width: "10%" }} className="">
//             <MDBDropdown dropleft>
//               <MDBDropdownToggle
//                 tag="a"
//                 href="#!"
//                 className="hidden-arrow nav-link"
//               >
//                 <img
//                   src="https://mdbootstrap.com/img/Photos/Avatars/img (31).jpg"
//                   className="rounded-circle"
//                   height="25"
                
//                   alt=""
//                   loading="lazy"
//                 />
//               </MDBDropdownToggle>

//               <MDBDropdownMenu>
//                 <MDBDropdownItem>Logout</MDBDropdownItem>
//               </MDBDropdownMenu>
//             </MDBDropdown>
//           </div>
//         </MDBContainer>
//       </div>
//     </header>
//   );
// };

// export default Breadcrumb;

