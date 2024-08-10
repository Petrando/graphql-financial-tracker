import { useQuery } from "@apollo/client";
import Card from "./Card.tsx";
import { GET_TRANSACTIONS } from "../graphql/queries/transaction.query";
import { GET_AUTHENTICATED_USER, GET_USER_AND_TRANSACTIONS } from "../graphql/queries/user.query";

interface Transaction {
  _id: string;
  description: string;
  paymentType: string;
  category: string;
  amount: number;
  location: string;
  date: string;
}

interface AuthUser {
  _id: string;
  username: string;
  name: string;
  profilePicture: string;
}

interface UserAndTransactions {
	user: {
		_id: string;
		name: string;
		username: string;
		profilePicture: string;
		transactions: Transaction[];
	};
}

interface TransactionsData {
  	transactions: Transaction[];
}

interface AuthUserData {
  	authUser: AuthUser;
}

const Cards: React.FC = () => {
	const { data, loading } = useQuery<TransactionsData>(GET_TRANSACTIONS);
	const { data: authUser } = useQuery<AuthUserData>(GET_AUTHENTICATED_USER);

	const { data: userAndTransactions } = useQuery<UserAndTransactions>(GET_USER_AND_TRANSACTIONS, {
			variables: {
			userId: authUser?.authUser?._id,
		},
	});

	console.log("userAndTransactions:", userAndTransactions);
	console.log("cards:", data);

	return (
		<div className="w-full px-10 min-h-[40vh]">
			<p className="text-5xl font-bold text-center my-10">History</p>
			<div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-start mb-20">
				{!loading &&
				data?.transactions.map((transaction) => (
					<Card key={transaction._id} transaction={transaction} authUser={authUser?.authUser} />
				))}
			</div>
			{!loading && data?.transactions?.length === 0 && (
				<p className="text-2xl font-bold text-center w-full">No transaction history found.</p>
			)}
		</div>
	);
};

export default Cards;
