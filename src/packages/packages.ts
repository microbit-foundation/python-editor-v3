export interface CodeSnippet {
  value: string;
  help: string;
}

export interface Package {
  name: string;
  snippets: CodeSnippet[];
}

export const packages: Package[] = [
  {
    name: "accelerometer",
    snippets: [
      {
        value: "get_x()",
        help: "Get the acceleration measurement in the x axis",
      },
      {
        value: "get_y()",
        help: "Get the acceleration measurement in the y axis",
      },
      {
        value: "get_z()",
        help: "Get the acceleration measurement in the z axis",
      },
    ],
  },
];
