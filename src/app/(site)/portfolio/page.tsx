import { PortfolioFolders } from '@/components/portfolio/PortfolioFolders';
import { getProjects } from '@/lib/content';

export const dynamic = 'force-dynamic';

export default function PortfolioPage() {
  const projects = getProjects();

  return (
    <PortfolioFolders
      projects={projects.map((project) => ({
        id: project.id,
        slug: project.slug,
        couple_names: project.couple_names,
        location: project.location,
        wedding_date: project.wedding_date,
        description: project.description,
        cover_url: project.cover_url,
        focal: project.focal,
      }))}
    />
  );
}
