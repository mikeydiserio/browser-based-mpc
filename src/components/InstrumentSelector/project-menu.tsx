"use client"

import type React from "react"

import styled from "styled-components"
import { useState, useRef } from "react"
import { useProject } from "@/hooks/use-project"
import { Save, FolderOpen, FileText, ChevronDown } from "lucide-react"

const MenuContainer = styled.div`
  position: relative;
`

const MenuButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #0a0a0a;
  border: 1px solid #333;
  border-radius: 4px;
  color: #e0e0e0;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #1a1a1a;
    border-color: #00d9ff;
  }

  svg {
    width: 14px;
    height: 14px;
  }
`

const Dropdown = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  min-width: 200px;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 6px;
  padding: 8px;
  display: ${(props) => (props.$isOpen ? "flex" : "none")};
  flex-direction: column;
  gap: 4px;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
`

const MenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: #e0e0e0;
  font-size: 12px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #2a2a2a;
    color: #00d9ff;
  }

  svg {
    width: 16px;
    height: 16px;
    color: #888;
  }

  &:hover svg {
    color: #00d9ff;
  }
`

const Divider = styled.div`
  height: 1px;
  background: #333;
  margin: 4px 0;
`

const HiddenFileInput = styled.input`
  display: none;
`

const ProjectNameDisplay = styled.div`
  font-size: 12px;
  color: #888;
  padding: 8px 12px;
  border-bottom: 1px solid #333;
  margin-bottom: 4px;
`

export function ProjectMenu() {
  const { projectName, downloadProject, loadProjectFromFile, createNewProject } = useProject()
  const [isOpen, setIsOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSave = () => {
    downloadProject()
    setIsOpen(false)
  }

  const handleLoad = () => {
    fileInputRef.current?.click()
    setIsOpen(false)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        await loadProjectFromFile(file)
        alert("Project loaded successfully!")
      } catch (error) {
        alert("Failed to load project: " + (error as Error).message)
      }
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleNew = () => {
    const name = prompt("Enter project name:", "New Project")
    if (name) {
      createNewProject(name)
    }
    setIsOpen(false)
  }

  return (
    <MenuContainer>
      <MenuButton onClick={() => setIsOpen(!isOpen)}>
        <FileText />
        Project
        <ChevronDown />
      </MenuButton>

      <Dropdown $isOpen={isOpen}>
        <ProjectNameDisplay>{projectName}</ProjectNameDisplay>

        <MenuItem onClick={handleNew}>
          <FileText />
          New Project
        </MenuItem>

        <MenuItem onClick={handleLoad}>
          <FolderOpen />
          Load Project
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleSave}>
          <Save />
          Save Project
        </MenuItem>
      </Dropdown>

      <HiddenFileInput ref={fileInputRef} type="file" accept=".dawsome.json,.json" onChange={handleFileChange} />
    </MenuContainer>
  )
}
