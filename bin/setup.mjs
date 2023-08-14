import gcloud from '@battis/partly-gcloudy';
import cli from '@battis/qui-cli';

(async () => {
  const args = gcloud.init({
    options: {
      name: { short: 'n', description: 'Name of Google Cloud project' }
    }
  });
  const name = await gcloud.projects.inputName({
    name: args.values.name,
    default: 'Course Planning Tool'
  });
  const projectId = await gcloud.projects.inputProjectId({
    projectId: args.values.project || process.env[args.values.projectEnvVar]
  });
  const project = await gcloud.projects.create({ name, projectId });
  cli.env.set({ key: args.values.projectEnvVar, value: project.projectId });
  cli.env.set({ key: 'PROJECT_NUMBER', value: project.projectNumber });
  gcloud.projects.active.set(project.projectId, project);
  gcloud.services.enable({ service: 'drive.googleapis.com' });
})();
