"use client"

import { useState } from "react"
import { ContractsList } from "./contracts-list"
import { CreateContractForm } from "./create-contract-form"
import { ContractEditor } from "./contract-editor"
import { ContractPreview } from "./contract-preview"

export function ProjectsContent() {
  const [activeView, setActiveView] = useState("list")
  const [selectedContract, setSelectedContract] = useState(null)
  const [selectedCustomer, setSelectedCustomer] = useState(null)

  const handleCreateContract = () => {
    setActiveView("create")
  }

  const handleEditContract = (contract) => {
    setSelectedContract(contract)
    setActiveView("editor")
  }

  const handlePreviewContract = (contract, customer = null) => {
    setSelectedContract(contract)
    setSelectedCustomer(customer)
    setActiveView("preview")
  }

  const handleBackToList = () => {
    setActiveView("list")
    setSelectedContract(null)
    setSelectedCustomer(null)
  }

  const handleContractSaved = () => {
    setActiveView("list")
    setSelectedContract(null)
  }

  switch (activeView) {
    case "create":
      return <CreateContractForm onBack={handleBackToList} onContractSaved={handleContractSaved} />
    case "editor":
      return (
        <ContractEditor contract={selectedContract} onBack={handleBackToList} onContractSaved={handleContractSaved} />
      )
    case "preview":
      return <ContractPreview contract={selectedContract} customer={selectedCustomer} onBack={handleBackToList} />
    default:
      return (
        <ContractsList
          onCreateContract={handleCreateContract}
          onEditContract={handleEditContract}
          onPreviewContract={handlePreviewContract}
        />
      )
  }
}
