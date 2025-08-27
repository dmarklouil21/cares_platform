import { Link, useLocation } from "react-router-dom";

const NotValidated = ({ fullName }) => {
  const location = useLocation();
  // const fullName = location.state?.fullName || "";
  return (
    <div className="h-screen w-full flex  flex-col justify-center items-center p-5 gap-7">
      <img
        src="/images/logo_black_text.png"
        className="h-[70px]"
        alt="RAFI LOGO"
      />

      <h2 className="text-[30px] md:text-5xl font-bold text-center">
        {fullName}, your pre-enrollment is still
        <span className="flex items-center justify-center gap-2">
          pending for validation
          <img src="/images/warning.png" className="h-[40px]" alt="RAFI LOGO" />
        </span>
      </h2>

      <p className="text-[12px] md:text-[16px] text-center">
        Our admin is currently reviewing your pre-enrollment form. You will be
        able to log in once <br /> your account has been approved. Please check
        back later or wait for further instructions.
      </p>

      <div className="w-full flex flex-col items-center justify-center gap-6">
        <Link
          to="/beneficiary-login"
          className="text-center font-bold bg-primary text-white py-3 w-[25%] border-[1px] border-primary hover:border-lightblue hover:bg-lightblue rounded-md"
        >
          Okay
        </Link>
        <hr className="w-[45%] border-[#6B7280]" />
      </div>
    </div>
  );
};

export default NotValidated;
