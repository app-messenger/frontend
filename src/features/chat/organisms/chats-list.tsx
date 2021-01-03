import React from "react";
import {useSelector} from "react-redux";
import styled from "styled-components";
import format from "date-fns/format";
import {Link, useParams} from "react-router-dom";

import {authSelectors} from "@features/auth";
import {Avatar, Icon, Text, RoundedNumber, BoldText, Skeleton} from "@ui/atoms";
import {Col} from "@lib/layout";
import {chatDialogsSelectors} from "../features/dialogs";
import {stringifyMessage} from "../lib";
import * as selectors from "../selectors";

const DEFAULT_SKELETON_COUNT = 5;

export const ChatsList: React.FC = () => {
  const credentials = useSelector(authSelectors.credentialsSelector);
  const dialogs = useSelector(chatDialogsSelectors.listSelector);
  const areDialogsFetching = useSelector(chatDialogsSelectors.areDialogsFetchingSelector);
  const search = useSelector(selectors.searchSelector);

  const {companionId} = useParams<{companionId: string}>();

  return (
    <List gap="2rem">
      {areDialogsFetching && Array.from({length: DEFAULT_SKELETON_COUNT}, (_, idx) => (
        <Wrapper key={idx}>
          <ChatAvatar>
            <Skeleton.Image/>
          </ChatAvatar>

          <Content>
            <Skeleton.Text width="50%"/>
            <Skeleton.Text width="80%"/>
          </Content>

          <Information>
            <Skeleton.Text width="2rem"/>
            <Skeleton.Text width="2rem"/>
          </Information>
        </Wrapper>
      ))}

      {dialogs && dialogs.map(({id, companion, lastMessage, unreadMessagesNumber, typing}) => {
        const selected = companion.id === companionId;
        const own = credentials!.id === lastMessage.sender.id;

        const info = unreadMessagesNumber ?
          <RoundedNumber digits={unreadMessagesNumber.toString().length} white>{unreadMessagesNumber}</RoundedNumber> :
          own && <Icon name={lastMessage.isRead ? "double-check" : "check"} gray={!selected}/>;

        return {
          id, info, selected,
          path: `/${companion.id}`,
          title: companion.firstName,
          avatar: companion.avatar,
          date: new Date(lastMessage.createdAt),
          text: typing ? "typing..." : `${own ? "You: " : ""}${stringifyMessage(lastMessage)}`
        };
      })
        .sort((a, b) => +a.date - +b.date)
        .filter(({title}) => title.toLowerCase().startsWith(search.toLowerCase()))
        .map(({id, path, title, avatar, text, date, selected, info}) => (
            <ChatLink key={id} to={path}>
              <Wrapper blue={selected}>
                <ChatAvatar>
                  <Avatar src={avatar}/>
                </ChatAvatar>

                <Content>
                  <BoldText space="nowrap">{title}</BoldText>
                  <Text space="nowrap" white={selected}>{text}</Text>
                </Content>

                <Information>
                  <Text white={selected}>{format(date, "HH:mm")}</Text>

                  {info}
                </Information>
              </Wrapper>
            </ChatLink>
          )
        )}
    </List>
  );
};

const List = styled(Col)`
  width: 100%;
`;

interface WrapperProps {
  blue?: boolean;
}

const Wrapper = styled.div<WrapperProps>`
  width: 100%;
  display: flex;
  background-color: ${({theme, blue}) =>
  blue ? theme.palette.secondary.main : theme.palette.primary.main};
  border-radius: 5px;
  padding: 1.5rem;
`;

const ChatAvatar = styled.div`
  width: 6.5rem;
  height: 6.5rem;
`;

const Content = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  width: 70%;
  padding: 1rem 0 1rem 1.5rem;
`;

const Information = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  width: calc(30% - 65px);
  padding: 1rem 0;
`;

const ChatLink = styled(Link)`
  text-decoration: none;
`;

const SkeletonItem = styled.div`
  
`;
