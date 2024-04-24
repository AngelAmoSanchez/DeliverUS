import React, { useContext, useEffect, useState } from 'react'
import { StyleSheet, Pressable, View } from 'react-native'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemibold'
import { AuthorizationContext } from '../../context/AuthorizationContext'
import { getOrders } from '../../api/OrderEndpoints'
import { showMessage } from 'react-native-flash-message'
import * as GlobalStyles from '../../styles/GlobalStyles'
import ImageCard from '../../components/ImageCard'
import restaurantLogo from '../../../assets/restaurantLogo.jpeg'
import { FlatList } from 'react-native-web'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export default function OrdersScreen ({ navigation, route }) {
  const [orders, setOrders] = useState([])
  const { loggedInUser } = useContext(AuthorizationContext)

  async function fetchOrders () {
    try {
      const fetchedOrders = await getOrders()
      fetchedOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      setOrders(fetchedOrders)
    } catch (error) {
      showMessage({
        message: `There was an error while retrieving orders. ${error} `,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  useEffect(() => {
    if (loggedInUser) {
      fetchOrders()
    } else {
      setOrders(null)
    }
  }, [loggedInUser, route, orders])

  const renderOrder = ({ item }) => {
    return (
      <ImageCard
        imageUri={item.restaurant.logo ? { uri: process.env.API_BASE_URL + '/' + item.restaurant.logo } : restaurantLogo}
        title={item.restaurant.name}
        onPress={() => {
          navigation.navigate('OrderDetailScreen', { id: item.id })
        }}
      >
        <TextRegular>Status: <TextSemiBold textStyle={item.status === 'in process' ? { color: GlobalStyles.brandSecondary } : item.status === 'sent' ? { color: GlobalStyles.brandGreen } : item.status === 'delivered' ? { color: 'blue' } : { color: GlobalStyles.brandPrimary }}>{item.status}</TextSemiBold></TextRegular>
        <TextRegular>Price: <TextSemiBold>{item.price}€</TextSemiBold></TextRegular>
        {item.status === 'pending' &&
        <View style={styles.actionButtonsContainer}>
          <Pressable
           onPress={() => navigation.navigate('EditOrderScreen', { orderId: item.id, id: item.restaurant.id })}
            style={({ pressed }) => [
              {
                backgroundColor: pressed
                  ? GlobalStyles.brandBlueTap
                  : GlobalStyles.brandBlue
              },
              styles.actionButton
            ]}>
            <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
              <MaterialCommunityIcons name='pencil' color={'white'} size={20}/>
              <TextRegular textStyle={styles.text}>
                Edit
              </TextRegular>
            </View>
          </Pressable>
        </View>}

      </ImageCard>
    )
  }

  const renderEmptyOrdersList = () => {
    return (
      <TextRegular textStyle={ styles.not_logged_in}>
        No orders were retrieved. Are you
        <TextSemiBold
        textStyle={ styles.not_logged_in}
        onPress={() => { navigation.navigate('Profile') }}> logged in?</TextSemiBold>
      </TextRegular>
    )
  }

  //  return (
  //        <View style={styles.container}>
  //          <View style={styles.FRHeader}>
  //           <TextSemiBold>FR5: Listing my confirmed orders</TextSemiBold>
  //            <TextRegular>A Customer will be able to check his/her confirmed orders, sorted from the most recent to the oldest.</TextRegular>
  //            <TextSemiBold>FR8: Edit/delete order</TextSemiBold>
  //            <TextRegular>If the order is in the state 'pending', the customer can edit or remove the products included or remove the whole order. The delivery address can also be modified in the state 'pending'. If the order is in the state 'sent' or 'delivered' no edition is allowed.</TextRegular>
  //          </View>
  //            <Pressable
  //                onPress={() => {
  //                  navigation.navigate('OrderDetailScreen', { id: Math.floor(Math.random() * 100) })
  //                }}
  //                style={({ pressed }) => [
  //                  {
  //                    backgroundColor: pressed
  //                      ? brandPrimaryTap
  //                      : brandPrimary
  //                  },
  //                  styles.button
  //                ]}
  //            >
  //                <TextRegular textStyle={styles.text}>Go to Order Detail Screen</TextRegular>
  //            </Pressable>
  //        </View>
  //  )
  // }

  return (
    <>
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={item => item.id.toString()}
          ListEmptyComponent={renderEmptyOrdersList}
        />
      </>
  )
}
/*
const styles = StyleSheet.create({
  FRHeader: { // TODO: remove this style and the related <View>. Only for clarification purposes
    justifyContent: 'center',
    alignItems: 'left',
    margin: 50
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 50
  },
  button: {
    borderRadius: 8,
    height: 40,
    margin: 12,
    padding: 10,
    width: '100%'
  },
  text: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center'
  }
})
*/
const styles = StyleSheet.create({
  not_logged_in: {
    fontSize: 30,
    marginTop: 100,
    textAlign: 'center'
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 50
  },
  button: {
    borderRadius: 8,
    height: 40,
    margin: 12,
    padding: 10,
    width: '100%'
  },
  text: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center'
  },
  actionButton: {
    borderRadius: 8,
    height: 40,
    marginTop: 12,
    margin: '1%',
    padding: 10,
    alignSelf: 'center',
    flexDirection: 'column',
    width: '50%'
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    bottom: 5,
    position: 'relative',
    width: '90%'
  }
})
