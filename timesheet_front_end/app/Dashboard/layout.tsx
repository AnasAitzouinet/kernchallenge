import { ProjectProvider } from '@/components/Providers/ProjectContext'
import React from 'react'

export default function layout({ children }: { children: React.ReactNode }) {
    return (
        <ProjectProvider>
            {children}
        </ProjectProvider>
    )
}
