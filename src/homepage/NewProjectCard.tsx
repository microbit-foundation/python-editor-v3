/**
 * (c) 2024-2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { RiAddLine } from "react-icons/ri";
import ActionCard from "./ActionCard";

interface NewProjectCardProps {
  onClick: () => void;
}

const NewProjectCard = ({ onClick }: NewProjectCardProps) => (
  <ActionCard onClick={onClick} icon={RiAddLine} textId="new-project-action" />
);

export default NewProjectCard;
