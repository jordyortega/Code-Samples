import React, { useState, useEffect, useContext } from "react";
import { View, StyleSheet, ActivityIndicator, TouchableWithoutFeedback, Keyboard, Dimensions, DeviceEventEmitter } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { activeListeners, Message, messageBuffer, WebSocketContext } from "@/components/WebSocketProvider";
import Config from "@/utils/Config";
import Helper from "@/utils/Helper";

import GameUI from "@/components/UI/GameUI";
import GameUITabs from "@/components/UI/GameUITabs";
import { ImageBackground } from "expo-image";
import Region0 from "@/app/maps/Region0";
import Constants from "@/utils/Constants";

import { StatusBar } from 'expo-status-bar';
import { AlertProvider } from "@/components/UI/AlertProvider";
import Chats from "@/components/UI/Chats";
import AccountSettings from "@/components/UI/Account/AccountSettings";
import GameLongPress from "@/components/UI/GameLongPress/GameLongPress";
import NPCList from "@/components/UI/NPCList/NPCList";

const Main = () => {
  const insets = useSafeAreaInsets();
  const context = useContext(WebSocketContext);

  const [loading, setLoading] = useState(true);
  const [regionId] = useState(Config.accountData?.regionId || 0); // Example state for region ID
  const [showTab, setShowTab] = useState(true);
  const [activeTab, setActiveTab] = useState<number | null>(Constants.TAB_BAG);
  const [showChat, setShowChat] = useState<boolean>(false);
  const [showUserSettings, setShowUserSettings] = useState<boolean>(false);
  const [showNPCList, setShowNPCList] = useState<boolean>(false);
  const [npcList, setNPCList] = useState<any>([]);

  const toggleTabON = () => {
    if (!showTab)
      setShowTab(true);
  };

  const toggleTab = () => {
    if (showTab) {
      setShowChat(false);
    }
    setShowTab((prev) => !prev);
  };
  
  const setTab = (tab: number | null) => {
    setActiveTab(tab);
  };

  const toggleChat = () => {
    setShowChat((prev) => !prev);
  };

  const doLoadNPCList = (message: Message) => {
    setNPCList(message.payload);
    setShowNPCList(true);
    console.log(message.payload);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <AlertProvider>
        <>
          <StatusBar hidden={true} />
          <SafeAreaView edges={["left", "right"]} style={{ flex: 1, backgroundColor: '#352f25' }}>
            <View style={styles.gameScreen}>

              {/* REGIONS */}
              <Region0
                data={{
                  width: Dimensions.get("window").width,
                  height: Dimensions.get("window").height - (showTab ? 200 : 60) - insets.bottom,
                }}
              />

              {/* GAME LONG PRESS OPTIONS */}
              <GameLongPress data={{ width: Dimensions.get("window").width, height: Dimensions.get("window").height - (showTab ? 200 : 60) - insets.bottom }} />

              {/* CHATS */}
              <Chats data={{ toggleChat, toggleTabON, showChat, showTab }} />

              {/* INTERFACES */}
              {showUserSettings && (
                <AccountSettings data={{ showTab, insets }} />
              )}
              {showNPCList && (
                <NPCList data={{ showTab, insets, npcList }} />
              )}
              
            </View>

            <View style={[styles.gameUI, { height: showTab ? 140 : 0, marginBottom: 60 + insets.bottom, }]} onTouchStart={() => Helper.closeAllWindowsGameScreen()}>

              {/* GAME UI (Inventory, Skills, Combat etc...) */}
              {showTab ?
                <ImageBackground
                  source={showChat ? require("../assets/ui/chatarea.png") : require("../assets/ui/tabarea.png")}
                  contentFit="fill"
                  style={{ flex: 1 }}
                >
                  <GameUI data={{ activeTab, showChat }} />
                </ImageBackground>
              : null}
            </View>

            {/* GAME TABS */}
            <GameUITabs data={{ showTab: toggleTab, setTab: setTab }} />

            <View style={[styles.bottomInset, { height: insets.bottom }]} />

          </SafeAreaView>
        </>
      </AlertProvider>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  gameScreen: {
    flex: 1,
    backgroundColor: "#000",
  },
  gameUI: {
    width: "100%",
    zIndex: 5,
    backgroundColor: "#352f25",
  },
  bottomInset: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#352f25",
    zIndex: 2,
  }
});

export default Main;
