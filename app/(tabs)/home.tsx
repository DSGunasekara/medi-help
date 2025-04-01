import { View, Text, StyleSheet } from "react-native";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

const GITHUB_AVATAR_URI = "https://i.pinimg.com/originals/ef/a2/8d/efa28d18a04e7fa40ed49eeb0ab660db.jpg";

export default function Tab() {
	return (
		<View style={styles.container}>
			<Avatar alt="Zach Nugent's Avatar">
				<AvatarImage source={{ uri: GITHUB_AVATAR_URI }} />
				<AvatarFallback>
					<Text>ZN</Text>
				</AvatarFallback>
			</Avatar>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "white",
	},
});
