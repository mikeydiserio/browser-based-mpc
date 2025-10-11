"use client"

import { useState } from "react"
import { ProjectManager } from "@/lib/project-manager"

export function useProject() {
  const [projectManager] = useState(() => ProjectManager.getInstance())
  const [projectName, setProjectName] = useState(() => projectManager.getProjectName())

  const saveProject = () => {
    return projectManager.saveProject()
  }

  const downloadProject = () => {
    projectManager.downloadProject()
  }

  const loadProjectFromFile = async (file: File) => {
    await projectManager.loadProjectFromFile(file)
    setProjectName(projectManager.getProjectName())
  }

  const createNewProject = (name?: string) => {
    projectManager.createNewProject(name)
    setProjectName(projectManager.getProjectName())
  }

  const updateProjectName = (name: string) => {
    projectManager.setProjectName(name)
    setProjectName(name)
  }

  return {
    projectName,
    saveProject,
    downloadProject,
    loadProjectFromFile,
    createNewProject,
    updateProjectName,
  }
}
