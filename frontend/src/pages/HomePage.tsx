/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useMutation, useQuery } from "@apollo/client";
import toast from "react-hot-toast";
import { MdLogout } from "react-icons/md";

import Cards from "../components/Cards";
import TransactionForm from "../components/TransactionForm";

import { LOGOUT } from "../graphql/mutations/user.mutation";
import { GET_TRANSACTION_STATISTICS } from "../graphql/queries/transaction.query";
import { GET_AUTHENTICATED_USER } from "../graphql/queries/user.query";

ChartJS.register(ArcElement, Tooltip, Legend);

interface CategoryStatistic {
    category: string;
    totalAmount: number;
}

interface ChartData {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string[];
      borderColor: string[];
      borderWidth: number;
      borderRadius: number;
      spacing: number;
      cutout: number;
    }[];
}

const HomePage: React.FC = () => {
    const { data: transactionStatsData } = useQuery(GET_TRANSACTION_STATISTICS);
    const { data: authUserData } = useQuery(GET_AUTHENTICATED_USER);

    const [logout, { loading, client }] = useMutation(LOGOUT, {
      refetchQueries: ["GetAuthenticatedUser"],
    });

    const [chartData, setChartData] = useState<ChartData>({
      labels: [],
      datasets: [
        {
          label: "$",
          data: [],
          backgroundColor: [],
          borderColor: [],
          borderWidth: 1,
          borderRadius: 30,
          spacing: 10,
          cutout: 130,
        },
      ],
    });

    useEffect(() => {
      if (transactionStatsData?.categoryStatistics) {
        const categories:string[] = transactionStatsData.categoryStatistics.map(
          (stat: CategoryStatistic) => stat.category
        );
        const totalAmounts = transactionStatsData.categoryStatistics.map(
          (stat: CategoryStatistic) => stat.totalAmount
        );

        const backgroundColors: string[] = [];
        const borderColors: string[] = [];

        categories.forEach((category) => {
          if (category === "saving") {
            backgroundColors.push("rgba(75, 192, 192)");
            borderColors.push("rgba(75, 192, 192)");
          } else if (category === "expense") {
            backgroundColors.push("rgba(255, 99, 132)");
            borderColors.push("rgba(255, 99, 132)");
          } else if (category === "investment") {
            backgroundColors.push("rgba(54, 162, 235)");
            borderColors.push("rgba(54, 162, 235)");
          }
        });

        setChartData((prev) => ({
          labels: categories,
          datasets: [
            {
              ...prev.datasets[0],
              data: totalAmounts,
              backgroundColor: backgroundColors,
              borderColor: borderColors,
            },
          ],
        }));
      }
    }, [transactionStatsData]);

    const handleLogout = async () => {
      try {
        await logout();
        // Clear the Apollo Client cache
        client.resetStore();
      } catch (error: any) {
        console.error("Error logging out:", error);
        toast.error(error.message);
      }
    };

    console.log(chartData)
    return (
      <>
        <div className="flex flex-col gap-6 items-center max-w-7xl mx-auto z-20 relative justify-center">
          <div className="flex items-center">
            <p className="md:text-4xl text-2xl lg:text-4xl font-bold text-center relative z-50 mb-4 mr-4 bg-gradient-to-r from-pink-600 via-indigo-500 to-pink-400 inline-block text-transparent bg-clip-text">
              Spend wisely, track wisely
            </p>
            <img
              src={authUserData?.authUser.profilePicture}
              className="w-11 h-11 rounded-full border cursor-pointer"
              alt="Avatar"
            />
            {!loading && (
              <MdLogout className="mx-2 w-5 h-5 cursor-pointer" onClick={handleLogout} />
            )}
            {loading && (
              <div className="w-6 h-6 border-t-2 border-b-2 mx-2 rounded-full animate-spin"></div>
            )}
          </div>
          <div className="flex flex-wrap w-full justify-center items-center gap-6">
            {transactionStatsData?.categoryStatistics.length > 0 && (
              <div className="h-[330px] w-[330px] md:h-[360px] md:w-[360px]">
                <Doughnut data={chartData} />
              </div>
            )}
            <TransactionForm />
          </div>
          <Cards />
        </div>
      </>
    );
};

export default HomePage;
