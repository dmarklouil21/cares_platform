import { Link } from "react-router-dom";

const IndividualScreeningView = () => {
  return (
    <div>
      <h1>Individual Screening View</h1>
      <p>This is the individual screening view page.</p>
      <Link to={"/Admin/patient/AdminIndividualScreening"}>
        <img src="/images/back.png" alt="Back button icon" className="h-14" />
      </Link>
    </div>
  );
};
export default IndividualScreeningView;
