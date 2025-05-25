// export interface ApiResponse<T> {
//   data: T;
//   message?: string;
//   statusCode?: number;
//   error?: string;
// }

export interface Sensor {
  id: number;
  type?: string;              // allowNull: true
  value?: number;             // allowNull: true
  status?: 'on' | 'off';      // allowNull: true, enum
  timestamp?: string | Date;  // allowNull: true
}

export interface Frame {
  id: number;
  file_path?: string;
  timestamp?: string | Date;
}

export interface Camera {
  camera_url: string;
}

export interface Height {
  id: number;
  sensor_id?: number;
  height?: number;
  timestamp?: string | Date;
}


export interface Adjustment {
  id: number;
  adjustment_type?: string;
  value?: number;
  timestamp?: string | Date;
}