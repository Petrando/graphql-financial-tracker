/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { FaLocationDot, FaSackDollar, FaTrash } from "react-icons/fa6";
import { BsCardText } from "react-icons/bs";
import { MdOutlinePayments } from "react-icons/md";
import { HiPencilAlt } from "react-icons/hi";
import { Link } from "react-router-dom";
import { formatDate } from "../utils/formatDate";
import toast from "react-hot-toast";
import { useMutation } from "@apollo/client";
import { DELETE_TRANSACTION } from "../graphql/mutations/transcation.mutation";

interface Transaction {
	_id: string;
	category: string;
	amount: number;
	location: string;
	date: string;
	paymentType: string;
	description: string;
}

interface AuthUser {
  	profilePicture: string;
}

interface CardProps {
	transaction: Transaction;
	authUser: AuthUser | undefined;
}

const categoryColorMap: Record<string, string> = {
	saving: "from-green-700 to-green-400",
	expense: "from-pink-800 to-pink-600",
	investment: "from-blue-700 to-blue-400",
	// Add more categories and corresponding color classes as needed
};

const capitalize = (text: string):string => {
	return text?text.toUpperCase() + text.slice(1):""
}

const Card: React.FC<CardProps> = ({ transaction, authUser }) => {
	const { category, amount, location, date, paymentType, description } = transaction;
	const cardClass = categoryColorMap[category];
	const [deleteTransaction, { loading }] = useMutation(DELETE_TRANSACTION, {
		refetchQueries: ["GetTransactions", "GetTransactionStatistics"],
	});
		
	const formattedDate = formatDate(date);

	const handleDelete = async () => {
		try {
		await deleteTransaction({ variables: { transactionId: transaction._id } });
		toast.success("Transaction deleted successfully");
		} catch (error: any) {
		console.error("Error deleting transaction:", error);
		toast.error(error.message);
		}
	};

	return (
		<div className={`rounded-md p-4 bg-gradient-to-br ${cardClass}`}>
		<div className="flex flex-col gap-3">
			<div className="flex flex-row items-center justify-between">
			<h2 className="text-lg font-bold text-white">{capitalize(category[0])}</h2>
			<div className="flex items-center gap-2">
				{!loading && <FaTrash className={"cursor-pointer"} onClick={handleDelete} />}
				{loading && <div className="w-6 h-6 border-t-2 border-b-2  rounded-full animate-spin"></div>}
				<Link to={`/transaction/${transaction._id}`}>
				<HiPencilAlt className="cursor-pointer" size={20} />
				</Link>
			</div>
			</div>
			<p className="text-white flex items-center gap-1">
			<BsCardText />
			Description: {capitalize(description[0])}
			</p>
			<p className="text-white flex items-center gap-1">
			<MdOutlinePayments />
			Payment Type: {capitalize(paymentType[0])}
			</p>
			<p className="text-white flex items-center gap-1">
			<FaSackDollar />
			Amount: ${amount}
			</p>
			<p className="text-white flex items-center gap-1">
			<FaLocationDot />
			Location: {location || "N/A"}
			</p>
			<div className="flex justify-between items-center">
			<p className="text-xs text-black font-bold">{formattedDate}</p>
			<img src={authUser?.profilePicture} className="h-8 w-8 border rounded-full" alt="" />
			</div>
		</div>
		</div>
	);
};

export default Card;
