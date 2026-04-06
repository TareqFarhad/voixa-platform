from pydantic import BaseModel


class ProcessingJob(BaseModel):
    job_id: str
    project_id: str
    vocal_asset_id: str
    instrumental_asset_id: str
