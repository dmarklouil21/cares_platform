import { PropagateLoader } from "react-spinners";

const SystemLoader = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40">
      {/* Logo */}
      {/* <img
        src="/images/logo_white_notxt.png"
        alt="Rafi Logo Icon"
        className="h-[60px] mb-6"
      /> */}

      {/* Spinner  */} 
      <PropagateLoader color="#FCB814" />
    </div>
  );
};

export default SystemLoader;