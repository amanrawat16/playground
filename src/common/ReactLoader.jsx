import { BallTriangle } from "react-loader-spinner";

const ReactLoader = () => {
  return (
    <div className="flex items-center justify-center w-full">
      <BallTriangle
        height={100}
        width={100}
        radius={5}
        color="#4fa94d"
        ariaLabel="ball-triangle-loading"
        wrapperStyle={{}}
        wrapperclassName=""
        visible={true}
      />
    </div>
  );
};

export default ReactLoader;
