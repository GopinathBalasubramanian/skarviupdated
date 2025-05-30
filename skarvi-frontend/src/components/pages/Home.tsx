import Navbar from "../Navbar";
import Homeboard from "../Homeboard";
import Physicaltrades from "../Physicaltrades";
import Papertrades from "../Papertrades";
import Chartering from "../Chartering";
import Reports from "../Reports";
import OperationsAndLogistics from "../OperationsAndLogistics";
import InventoryManagement from "../InventoryManagement";
import EndOfDay from "../EndOfDay";
import AdminTools from "../AdminTools";
import AddPhysicaltrade from "../Physicaltrade_Addbought";
// import Development from "../components/Development";
import AddNewTrade from "../Papertrades_AddNewTrade";
const Home = () => {
    return(
<>
<Navbar/>
<Homeboard/>
<Physicaltrades/>
<Papertrades/>
<Chartering/>
<Reports/>
<OperationsAndLogistics/>
<InventoryManagement/>
<EndOfDay/>
<AdminTools/>
{/* <Development/> */}
<AddNewTrade/>
<AddPhysicaltrade />

</>
    );
};
export default Home;