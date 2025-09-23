import { Suspense } from "react"
import { ProjectsContent } from "@/components/projects/projects-content"
import { ProjectsLoading } from "@/components/projects/projects-loading"

export default function ProjectsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Gestión de Contratos</h2>
      </div>
      <Suspense fallback={<ProjectsLoading />}>
        <ProjectsContent />
      </Suspense>
    </div>
  )
}
