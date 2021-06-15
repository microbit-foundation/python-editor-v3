import { DeploymentConfig } from "..";
import { NullLogging } from "./logging";
import theme from "./theme";

const defaultDeployment: DeploymentConfig = {
  chakraTheme: theme,
  logging: new NullLogging(),
};

export default defaultDeployment;
