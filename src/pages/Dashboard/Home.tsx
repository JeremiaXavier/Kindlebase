
import PageMeta from "../../components/common/PageMeta";
import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";

export default function Home() {
  return (
    <>
      <PageMeta
        title="Kindlebase"
        description="Dashboard of Kindlebase"
      />
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0 opacity-5">
        <img
          src="./images/logo/icon.png"
          alt="Watermark"
          className="w-1/2 max-w-[400px]"
        />
      </div>
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
      <EcommerceMetrics /> 

        {/*   <MonthlySalesChart />  */}
        </div>

        <div className="col-span-12 xl:col-span-5">
           <MonthlyTarget /> 
        </div>

        <div className="col-span-12">
         {/*  <StatisticsChart /> */}
        </div>

        <div className="col-span-12 xl:col-span-5">
         {/*  <DemographicCard /> */}
        </div>

        <div className="col-span-12 xl:col-span-7">
          {/* <RecentOrders /> */}
        </div>
      </div>
    </>
  );
}
