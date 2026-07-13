/**
 * (c) 2024-2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { useCallback } from "react";
import { RiFolderOpenLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { createProjectsPageUrl } from "../urls";
import ActionCard from "./ActionCard";

const ViewAllProjectsCard = () => {
  const navigate = useNavigate();
  const handleClick = useCallback(() => {
    navigate(createProjectsPageUrl());
  }, [navigate]);
  return (
    <ActionCard
      onClick={handleClick}
      icon={RiFolderOpenLine}
      textId="view-all-projects"
    />
  );
};

export default ViewAllProjectsCard;
