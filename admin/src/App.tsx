import {
  Admin,
  Datagrid,
  DateField,
  FunctionField,
  List,
  NumberField,
  Resource,
  Show,
  SimpleShowLayout,
  TextField,
  defaultTheme,
} from "react-admin";
import { authProvider } from "./authProvider";
import { dataProvider } from "./dataProvider";
import { AdminDashboard } from "./AdminDashboard";

const theme = {
  ...defaultTheme,
  palette: {
    ...defaultTheme.palette,
    primary: { main: "#14532d" },
    secondary: { main: "#d4a012" },
  },
};

const UserList = () => (
  <List perPage={25} sort={{ field: "createdAt", order: "DESC" }}>
    <Datagrid rowClick="show">
      <TextField source="name" />
      <TextField source="email" />
      <TextField source="phone" />
      <TextField source="district" />
      <TextField source="role" />
      <NumberField source="averageRating" options={{ maximumFractionDigits: 1 }} />
      <DateField source="createdAt" showTime />
    </Datagrid>
  </List>
);

const UserShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="name" />
      <TextField source="email" />
      <TextField source="phone" />
      <TextField source="district" />
      <TextField source="role" />
      <TextField source="bio" />
      <DateField source="createdAt" showTime />
    </SimpleShowLayout>
  </Show>
);

const ExchangeList = () => (
  <List perPage={25} sort={{ field: "createdAt", order: "DESC" }}>
    <Datagrid bulkActionButtons={false}>
      <TextField source="id" label="ID" />
      <TextField source="status" />
      <FunctionField label="From" render={(r: { user1?: { name?: string } }) => r.user1?.name ?? "—"} />
      <FunctionField label="To" render={(r: { user2?: { name?: string } }) => r.user2?.name ?? "—"} />
      <FunctionField
        label="Skills"
        render={(r: { skillOffered?: { nameEn?: string }; skillWanted?: { nameEn?: string } }) =>
          `${r.skillOffered?.nameEn ?? "?"} ↔ ${r.skillWanted?.nameEn ?? "?"}`
        }
      />
      <DateField source="createdAt" showTime />
    </Datagrid>
  </List>
);

export default function App() {
  return (
    <Admin
      title="SkillSwap Malawi — Admin (Executive Summary spec)"
      theme={theme}
      dataProvider={dataProvider}
      authProvider={authProvider}
      dashboard={AdminDashboard}
    >
      <Resource name="users" list={UserList} show={UserShow} recordRepresentation="name" />
      <Resource name="exchanges" list={ExchangeList} />
    </Admin>
  );
}
