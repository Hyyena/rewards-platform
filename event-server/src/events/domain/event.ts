export enum EventStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export class Event {
  id?: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: EventStatus;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(params: {
    id?: string;
    name: string;
    description: string;
    startDate: Date;
    endDate: Date;
    status?: EventStatus;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = params.id;
    this.name = params.name;
    this.description = params.description;
    this.startDate = params.startDate;
    this.endDate = params.endDate;
    this.status = params.status || EventStatus.INACTIVE;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }

  toSchema(): Record<string, any> {
    const schema: Record<string, any> = {
      name: this.name,
      description: this.description,
      startDate: this.startDate,
      endDate: this.endDate,
      status: this.status,
    };

    if (this.id) {
      schema._id = this.id;
    }

    return schema;
  }
}
