import { ReactNode } from "react"
import { useRouterState } from "./router-hooks"
import ProjectBrowser from "./project/ProjectBrowser";

interface ProjectPageRoutingProps {
    children: ReactNode
}
const ProjectPageRouting = ({children} : ProjectPageRoutingProps) => {
    const [{tab}] = useRouterState();
    if (typeof tab === "undefined") {
        return <ProjectBrowser />
    }
    return children;
}

export default ProjectPageRouting;
