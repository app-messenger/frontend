import React, {useEffect, useState} from "react";
import styled from "styled-components";
import {useSelector} from "react-redux";

import {directsActions, directsSelectors} from "@features/directs";
import {groupsActions, groupsSelectors} from "@features/groups";
import {ChatsList} from "@features/chats";
import {Col, Row} from "@lib/layout";
import {useRootDispatch} from "@lib/store";
import {Icon, H4, Input, Text, H3} from "@ui/atoms";
import {MainTemplate} from "@ui/templates";

export const HomePage: React.FC = () => {
  const dispatch = useRootDispatch();

  const directChats = useSelector(directsSelectors.chats);
  const areDirectChatsFetching = useSelector(directsSelectors.areChatsFetching);

  const groupChats = useSelector(groupsSelectors.chats);
  const areGroupChatsFetching = useSelector(groupsSelectors.areChatsFetching);

  const toFetchDirectChats = !directChats && !areDirectChatsFetching;
  const toFetchGroupChats = !groupChats && !areGroupChatsFetching;

  useEffect(() => {
    if (toFetchDirectChats) dispatch(directsActions.fetchChats());
    if (toFetchGroupChats) dispatch(groupsActions.fetchChats());
  }, []);

  return (
    <MainTemplate>
      <Wrapper>
        <SidebarWrapper>
          <Sidebar>
            <Icon name="logo"/>
          </Sidebar>
        </SidebarWrapper>

        <ListPanelWrapper>
          <Col gap="3rem">
            <Row justify="space-between">
              <H4>Messages</H4>
              <Text clickable secondary>
                + Create new chat
              </Text>
            </Row>

            <SearchBar/>
          </Col>

          <ChatsList/>
        </ListPanelWrapper>

        <ChatPanelWrapper>
          <H3>Select chat to start messaging</H3>
        </ChatPanelWrapper>
      </Wrapper>
    </MainTemplate>
  );
};

const SearchBar: React.FC = () => {
  const [text, setText] = useState("");

  return (
    <Input placeholder="Search chat"
           onChange={({currentTarget}) => setText(currentTarget.value)}
           value={text}/>
  );
};

const Wrapper = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: row;
  background-color: ${({theme}) => theme.palette.primary.main};
`;

const SidebarWrapper = styled.aside`
  width: 10%;
  padding: 3rem 0 3rem 2rem;
`;

const Sidebar = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: ${({theme}) => theme.palette.primary.light};
  border-radius: 1rem;
  padding: 3rem 0;
`;

const ListPanelWrapper = styled(Col).attrs(() => ({
  gap: "3rem"
}))`
  width: 30%;
  height: 100%;
  padding: 4rem;
`;

const ChatPanelWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 60%;
  height: 100%;
  border-left: 2px solid ${({theme}) => theme.palette.divider};
`;


