import React, {useEffect} from "react";
import {useSelector} from "react-redux";
import {useParams} from "react-router-dom";
import styled from "styled-components";
import {nanoid} from "nanoid";
import {unwrapResult} from "@reduxjs/toolkit";

import {authSelectors} from "@features/auth";
import {ChatsList, formatMessageDate, ChatForm, useFetchingChats, ChatCreationModal, SearchBar} from "@features/chats";
import {directsSelectors, directsActions, DirectMessagesList, DirectAttachmentsModal} from "@features/directs";
import {Col, Row} from "@lib/layout";
import {ID} from "@lib/typings";
import {useModal} from "@lib/modal";
import {useRootDispatch} from "@lib/store";
import {Skeleton} from "@lib/skeleton";
import {H4, Icon, Text} from "@ui/atoms";
import {Avatar} from "@ui/molecules";
import {MainTemplate} from "@ui/templates";

export const DirectPage = () => {
  const dispatch = useRootDispatch();

  useFetchingChats();

  const {partnerId} = useParams<{partnerId: ID}>();

  const {closeModal, isModalOpen, openModal} = useModal();

  const chat = useSelector(directsSelectors.chat(partnerId));
  const messages = useSelector(directsSelectors.messages(partnerId));
  const areMessagesFetching = useSelector(directsSelectors.areMessagesFetching(partnerId));
  const areMessagesFetched = useSelector(directsSelectors.areMessagesFetched(partnerId));
  const isChatFetching = useSelector(directsSelectors.isChatFetching(partnerId));

  const toFetchChat = !chat && !isChatFetching;
  const toFetchMessages = !areMessagesFetched && !areMessagesFetching;

  useEffect(() => {
    if (toFetchChat) {
      dispatch(directsActions.fetchChat({partnerId}))
        .then(unwrapResult)
        .then(() => {
          if (toFetchMessages) {
            dispatch(directsActions.fetchMessages({
              partnerId, skip: messages.length
            }));
          }
        });
    }
  }, [partnerId]);

  return (
    <>
      {isModalOpen && <ChatCreationModal closeModal={closeModal}/>}

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
                <Text
                  onClick={openModal}
                  clickable secondary>
                  + Create new chat
                </Text>
              </Row>

              <SearchBar/>
            </Col>

            <ChatsList/>
          </ListPanelWrapper>

          <ChatPanelWrapper>
            <DirectChat/>
          </ChatPanelWrapper>
        </Wrapper>
      </MainTemplate>
    </>
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

const DirectChat: React.FC = () => {
  const dispatch = useRootDispatch();

  const {closeModal, openModal, isModalOpen} = useModal();

  const {partnerId} = useParams<{partnerId: ID}>();

  const credentials = useSelector(authSelectors.credentials)!;
  const chat = useSelector(directsSelectors.chat(partnerId))!;
  const isFetching = useSelector(directsSelectors.isChatFetching(partnerId));

  if (isFetching) return <DirectSkeleton/>;

  if (!chat) return null;

  return (
    <>
      {isModalOpen && (
        <DirectAttachmentsModal
          closeModal={closeModal}/>
      )}

      <Col width="100%" height="100%">
        <Header>
          <Row width="100%" height="100%" justify="space-between" align="center">
            <Row height="100%" gap="3rem" align="center">
              <Avatar url={chat.partner.avatar}/>

              <Col height="100%" justify="space-between" padding="1rem 0">
                <H4>{chat.partner.username}</H4>
                <Text small>Last seen at {formatMessageDate(new Date(chat.partner.lastSeen))}</Text>
              </Col>
            </Row>

            <Row gap="3rem">
              <Icon name="attachment" onClick={openModal} pointer/>
              <Icon name="options" pointer/>
            </Row>
          </Row>
        </Header>

        <DirectMessagesList />

        <ChatForm handleSubmit={
          ({images, files, text, audio}) => {
            const id = nanoid();

            const date = new Date();

            dispatch(directsActions.addMessage({
              partnerId, chat,
              isOwn: true,
              message: {
                id, files, text,
                chat: chat.details,
                sender: {...credentials, isBanned: chat.isBanned},
                audio: audio && audio.url,
                images: images && images.map(({url}) => url),
                isSystem: false,
                isRead: false,
                isEdited: false,
                parent: null,
                createdAt: date.toString()
              }
            }));

            dispatch(directsActions.fetchSendingMessage({
              text,
              parentId: null,
              partnerId: chat.partner.id,
              imagesIds: images && images.map(({id}) => id),
              filesIds: files && files.map(({id}) => id),
              audioId: audio && audio.id
            })).then(unwrapResult)
              .then(({message}) => {
                dispatch(directsActions.updateMessage({
                  partnerId,
                  messageId: id,
                  partial: message
                }));
              });
          }}/>
      </Col>
    </>
  );
};

const Header = styled(Row).attrs(() => ({
  width: "100%",
  align: "center",
  padding: "3rem 4.5rem"
}))`
  border-bottom: 2px solid ${({theme}) => theme.palette.divider};
`;

const DirectSkeleton: React.FC = () => (
  <Col width="100%" height="100%">
    <Header>
      <Row width="100%" height="100%" justify="space-between" align="center">
        <Row height="100%" gap="3rem" align="center">
          <Skeleton.Avatar/>

          <Col gap="1rem" height="100%" justify="space-between" padding="1rem 0">
            <Skeleton.Text width="20rem"/>
            <Skeleton.Text width="10rem"/>
          </Col>
        </Row>

        <Row gap="3rem">
          <Icon name="attachment" pointer/>
          <Icon name="options" pointer/>
        </Row>
      </Row>
    </Header>

    <DirectMessagesList />

    <ChatForm handleSubmit={() => null}/>
  </Col>
);